import { Log } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'MonarchNavConfigService';

// Default config to upload if missing in Site Assets
const DEFAULT_CONFIG = {
  items: [
    {
      name: "Home",
      link: ""
    }
  ]
};

/**
 * Service to ensure monarchNavConfig.json exists in Site Assets, and create it if not.
 */
export class MonarchNavConfigService {
  /**
   * Checks for monarchNavConfig.json in Site Assets. Creates it if not present.
   * @param context The SPFx extension context
   */
  public static async ensureConfigFile(context: BaseApplicationCustomizer<unknown>["context"]): Promise<void> {
    const siteUrl = context.pageContext.web.absoluteUrl;
    try {
      // Check if the file exists using REST API (returns 200 or 404)
      const checkResponse: SPHttpClientResponse = await context.spHttpClient.get(
        `${siteUrl}/_api/web/GetFileByServerRelativeUrl('/SiteAssets/monarchNavConfig.json')`,
        SPHttpClient.configurations.v1
      );
      if (checkResponse.status === 200) {
        Log.info(LOG_SOURCE, 'monarchNavConfig.json already exists.');
        return;
      }
    } catch (error) {
      // If not found, upload the default config as a site asset
      const status = (error as { status?: number })?.status;
      if (status === 404) {
        Log.info(LOG_SOURCE, 'monarchNavConfig.json not found. Uploading default config as Site Asset...');
        // Use Blob for binary upload, do not set Content-Type header
        await context.spHttpClient.post(
          `${siteUrl}/_api/web/Lists/GetByTitle('Site Assets')/RootFolder/Files/add(overwrite=true,url='monarchNavConfig.json')`,
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
