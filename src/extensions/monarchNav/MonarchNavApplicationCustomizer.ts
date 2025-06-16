import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderName,
  PlaceholderContent
} from '@microsoft/sp-application-base';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import Container from './components/Container'
import { MonarchNavConfigService, IMonarchNavConfig } from './MonarchNavConfigService';

const LOG_SOURCE: string = 'MonarchNavApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMonarchNavApplicationCustomizerProperties {
  // Debug mode flag (optional)
  debugMode?: boolean;
  // Test message for compatibility
  testMessage?: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MonarchNavApplicationCustomizer
  extends BaseApplicationCustomizer<IMonarchNavApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Initializing MonarchNav extension...");
      
      let config: IMonarchNavConfig;
      
      try {
        // Load configuration from deployed file in SharePoint Site Assets
        config = await MonarchNavConfigService.loadConfig(this.context);
        Log.info(LOG_SOURCE, `Configuration loaded successfully`);
      } catch (configError) {
        Log.warn(LOG_SOURCE, `Failed to load config, using default: ${configError}`);
        // Use default configuration if loading fails
        config = {
          themes: {
            backgroundColor: '#0078d4',
            textColor: '#ffffff',
            is_sp_header: false,
            items_font_size: '14px',
            logoUrl: '',
            logoSize: '32px',
            fontStyle: 'normal'
          },
          items: [
            {
              name: 'Home',
              link: this.context.pageContext.web.absoluteUrl,
              target: '_self' as const,
              children: []
            }
          ]
        };
      }
      
      // Create React element with loaded configuration
      const element: React.ReactElement = React.createElement(
        Container,
        {
          context: this.context,
          config: config
        }
      );

      // Render the extension
      const topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top
      );

      if (topPlaceholder) {
        this._topPlaceholder = topPlaceholder;
        ReactDom.render(element, topPlaceholder.domElement);
        Log.info(LOG_SOURCE, "MonarchNav extension rendered successfully");
      } else {
        Log.error(LOG_SOURCE, new Error("Unable to create top placeholder for MonarchNav"));
      }

    } catch (error) {
      Log.error(LOG_SOURCE, new Error(`Critical error in MonarchNav initialization: ${error}`));
      // Try to render a minimal fallback navigation
      this._renderFallbackNavigation();
    }

    return Promise.resolve();
  }

  private _renderFallbackNavigation(): void {
    try {
      const topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top
      );

      if (topPlaceholder) {
        this._topPlaceholder = topPlaceholder;
        const fallbackElement = document.createElement('div');
        fallbackElement.innerHTML = `
          <div style="background-color: #0078d4; color: white; padding: 10px 20px; display: flex; align-items: center;">
            <span style="font-weight: bold;">MonarchNav</span>
            <span style="margin-left: auto; font-size: 12px;">Configuration loading...</span>
          </div>
        `;
        topPlaceholder.domElement.appendChild(fallbackElement);
        Log.info(LOG_SOURCE, "Fallback navigation rendered");
      }
    } catch (fallbackError) {
      Log.error(LOG_SOURCE, new Error(`Failed to render fallback navigation: ${fallbackError}`));
    }
  }

  public onDispose(): void {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
