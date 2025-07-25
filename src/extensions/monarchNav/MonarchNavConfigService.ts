import { Log } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

const LOG_SOURCE: string = 'MonarchNavConfigService';

export interface IMonarchNavItem {
  name: string;
  link: string;
  target?: '_self' | '_blank';
  description?: string;
  children?: IMonarchNavItem[];
}

export interface IMonarchNavConfig {
  themes: {
    backgroundColor: string;
    textColor: string;
    is_sp_header: boolean;
    is_suite_nav: boolean;
    is_command_bar: boolean;
    is_app_bar: boolean;
    items_font_size: string;
    logoUrl: string;
    logoSize: string;
    padding_top_bottom: string;
    padding_left_right: string;
    fontStyle: string;
    items_alignment: string;
  };
  items: IMonarchNavItem[];
}

// Fallback configuration (only used if deployment file is missing/corrupted)
const FALLBACK_CONFIG: IMonarchNavConfig = {
  themes: {
    backgroundColor: "#ffffff",
    textColor: "#6c757d",
    is_sp_header: true,
    is_suite_nav: true,
    is_command_bar: true,
    is_app_bar: true,
    items_font_size: "18px",
    logoUrl: "",
    logoSize: "40px",
    padding_top_bottom: "8px",
    padding_left_right: "8px",
    fontStyle: "normal",
    items_alignment: "left"
  },
  items: [
    {
      name: "Home",
      link: "",
      target: "_self"
    },
    {
      name: "Another",
      link: "",
      target: "_self",
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
   * Load configuration from SharePoint Site Assets
   * File is provisioned during solution deployment via elements.xml
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
      
      Log.info(LOG_SOURCE, `Loading configuration from deployed file: ${fileUrl}`);
      
      const getUrl = `${siteUrl}/_api/web/GetFileByServerRelativeUrl('${fileUrl}')/$value`;
      
      const response: SPHttpClientResponse = await context.spHttpClient.get(
        getUrl,
        SPHttpClient.configurations.v1
      );

      if (response.ok) {
        const configText = await response.text();
        const config: IMonarchNavConfig = JSON.parse(configText);
        
        Log.info(LOG_SOURCE, "Configuration loaded successfully from deployed file");
        return config;
        
      } else {
        Log.warn(LOG_SOURCE, `Deployed config file not found: ${response.status}. Using fallback configuration.`);
        return FALLBACK_CONFIG;
      }
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      Log.info(LOG_SOURCE, "Error loading deployed configuration, using fallback");
      return FALLBACK_CONFIG;
    }
  }

  /**
   * Save configuration to SharePoint Site Assets
   * Updates the file that was originally provisioned during deployment
   * @param context SPFx extension context
   * @param config Configuration object to save
   */
  public static async saveConfig(
    context: BaseApplicationCustomizer<unknown>["context"], 
    config: IMonarchNavConfig
  ): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Saving configuration to deployed file...");
      
      const siteUrl = context.pageContext.web.absoluteUrl;
      const serverRelativeUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/SiteAssets`;
      
      // Convert config to JSON string with proper formatting
      const configJson = JSON.stringify(config, null, 4);
      const blob = new Blob([configJson], { type: 'application/json' });
      
      // Update the provisioned file (overwrite existing)
      const uploadUrl = `${siteUrl}/_api/web/GetFolderByServerRelativeUrl('${serverRelativeUrl}')/Files/add(overwrite=true,url='monarchNavConfig.json')`;
      
      const response: SPHttpClientResponse = await context.spHttpClient.post(
        uploadUrl,
        SPHttpClient.configurations.v1,
        {
          body: blob
        }
      );

      if (response.ok) {
        Log.info(LOG_SOURCE, "Configuration saved successfully to deployed file");
      } else {
        let errorData: unknown = null;
        try {
          errorData = await response.clone().json();
        } catch {
          errorData = await response.text();
        }
        Log.error(LOG_SOURCE, new Error(`Failed to save config: ${JSON.stringify(errorData)}`));
        throw new Error("Failed to save configuration");
      }
      
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
      throw error;
    }
  }
}