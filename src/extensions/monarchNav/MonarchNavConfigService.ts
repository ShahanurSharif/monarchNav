import { Log } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'MonarchNavConfigService';

export interface IMonarchNavItem {
  name: string;
  link: string;
  target?: string;
  children?: IMonarchNavItem[];
}

export interface IMonarchNavConfig {
  themes: {
    backgroundColor: string;
    textColor: string;
    is_sp_header: boolean;
    items_font_size: string;
  };
  items: IMonarchNavItem[];
}

const DEFAULT_CONFIG: IMonarchNavConfig = {
  themes: {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    is_sp_header: false,
    items_font_size: "18px"
  },
  items: [
    {
      name: "Home",
      link: ""
    },
    {
      name: "Home",
      link: "",
      children: [
        {
          name: "Sub Item 1",
          link: ""
        },
        {
          name: "Sub Item 2", 
          link: ""
        }
      ]
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
      // First, check if the file already exists
      const serverRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets/monarchNavConfig.json`;
      console.log('Checking file at:', serverRelativeUrl);
      console.log('Full GET URL:', `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')`);
      
      const checkResponse: SPHttpClientResponse = await context.spHttpClient.get(
        `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${serverRelativeUrl}')`,
        SPHttpClient.configurations.v1
      );
      
      console.log('GET Response Status:', checkResponse.status);
      console.log('GET Response OK:', checkResponse.ok);
      
      if (checkResponse.status === 200) {
        console.log('File already exists, skipping creation');
        Log.info(LOG_SOURCE, 'monarchNavConfig.json already exists.');
        return;
      }
      
    } catch (getError) {
      console.log('GET Error (expected if file does not exist):', getError);
      
      // If file doesn't exist (404 or similar), proceed to create it
      console.log('File does not exist, creating new one...');
    }
    
    // Create the file since it doesn't exist
    try {
      console.log('About to create config file with DEFAULT_CONFIG:', JSON.stringify(DEFAULT_CONFIG, null, 2));
      
      const folderServerRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      console.log('Target folder URL:', folderServerRelativeUrl);
      console.log('Full POST URL:', `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl}')/Files/add(overwrite=true,url='monarchNavConfig.json')`);
      
      const postResponse = await context.spHttpClient.post(
        `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderServerRelativeUrl}')/Files/add(overwrite=true,url='monarchNavConfig.json')`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata'
          },
          body: new Blob([JSON.stringify(DEFAULT_CONFIG)], { type: 'application/json' })
        }
      );
      
      console.log('POST Response Status:', postResponse.status);
      console.log('POST Response OK:', postResponse.ok);
      
      if (postResponse.ok) {
        const responseData = await postResponse.json();
        console.log('POST Response Data:', responseData);
        Log.info(LOG_SOURCE, 'monarchNavConfig.json uploaded to Site Assets root.');
      } else {
        const errorText = await postResponse.text();
        console.error('POST Error:', errorText);
        Log.error(LOG_SOURCE, new Error(`Failed to upload config file: ${postResponse.status} - ${errorText}`));
      }
    } catch (error) {
      console.error('Error creating config file:', error);
      Log.error(LOG_SOURCE, error as Error);
    }
  }

  /**
   * Load configuration from SharePoint Site Assets
   * @param context SPFx extension context
   * @returns Promise<IMonarchNavConfig> Configuration object
   */
  public static async loadConfig(
    context: BaseApplicationCustomizer<unknown>["context"]
  ): Promise<IMonarchNavConfig> {
    try {
      const siteUrl = context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      const fileUrl = `${serverRelativeUrl}/monarchNavConfig.json`;
      
      Log.info(LOG_SOURCE, `Loading configuration from: ${fileUrl}`);
      
      const getUrl = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${fileUrl}')/$value`;
      
      const response: SPHttpClientResponse = await context.spHttpClient.get(
        getUrl,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        const configText = await response.text();
        const config: IMonarchNavConfig = JSON.parse(configText);
        
        Log.info(LOG_SOURCE, "Configuration loaded successfully");
        return config;
        
      } else {
        Log.warn(LOG_SOURCE, `Failed to load config: ${response.status}`);
        throw new Error(`Failed to load configuration: ${response.status}`);
      }
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      
      // Return default configuration as fallback
      Log.info(LOG_SOURCE, "Using default configuration as fallback");
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Save configuration to SharePoint Site Assets
   * @param context SPFx extension context
   * @param config Configuration object to save
   */
  public static async saveConfig(
    context: BaseApplicationCustomizer<unknown>["context"], 
    config: IMonarchNavConfig
  ): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Saving configuration to SharePoint...");
      
      const siteUrl = context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      
      // Convert config to JSON string with proper formatting
      const configJson = JSON.stringify(config, null, 4);
      const blob = new Blob([configJson], { type: 'application/json' });
      
      // Upload the updated file (overwrite existing)
      const uploadUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files/add(overwrite=true,url='monarchNavConfig.json')`;
      
      const response: SPHttpClientResponse = await context.spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          body: blob
        }
      );

      if (response.ok) {
        Log.info(LOG_SOURCE, "Configuration saved successfully");
      } else {
        const errorData = await response.json();
        Log.error(LOG_SOURCE, new Error(`Failed to save config: ${JSON.stringify(errorData)}`));
        throw new Error("Failed to save configuration");
      }
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }
}
