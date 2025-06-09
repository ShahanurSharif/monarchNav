import { Log } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'MonarchNavConfigService';

const DEFAULT_CONFIG = {
  items: [
    {
      name: "Home",
      link: ""
    }
  ]
};

export class MonarchNavConfigService {
  /**
   * @param context The SPFx extension context
   */
  public static async ensureConfigFile(context: BaseApplicationCustomizer<unknown>["context"]): Promise<void> {
    const siteUrl = context.pageContext.web.absoluteUrl;
    console.log(`Checking for monarchNavConfig.json in Site Assets at: ${siteUrl}`);
    try {
      const serverRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets/monarchNavConfig.json`;
      const checkResponse: SPHttpClientResponse = await context.spHttpClient.get(
        `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')`,
        SPHttpClient.configurations.v1
      );
      if (checkResponse.status === 200) {
        Log.info(LOG_SOURCE, 'monarchNavConfig.json already exists.');
        return;
      }
    } catch (error) {
      const status = (error as { status?: number })?.status;
      console.log('Error checking monarchNavConfig.json:', status);
      if (status === 404 || status === 400) {
        Log.info(LOG_SOURCE, 'monarchNavConfig.json not found. Uploading default config as Site Asset...');
        const folderServerRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
        await context.spHttpClient.post(
          `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl}')/Files/add(overwrite=true,url=monarchNavConfig.json)`,
          SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=nometadata'
            },
            body: new Blob([JSON.stringify(DEFAULT_CONFIG)], { type: 'application/json' })
          }
        );
        Log.info(LOG_SOURCE, 'monarchNavConfig.json uploaded to Site Assets root.');
      } else {
        Log.error(LOG_SOURCE, error);
      }
    }
  }
}
