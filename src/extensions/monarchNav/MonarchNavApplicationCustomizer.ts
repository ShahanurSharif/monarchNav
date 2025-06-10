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
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class MonarchNavApplicationCustomizer
  extends BaseApplicationCustomizer<IMonarchNavApplicationCustomizerProperties> {

  private _topPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    try {
      Log.info(LOG_SOURCE, "Initializing MonarchNav extension...");
      
      // Ensure config file exists
      await MonarchNavConfigService.ensureConfigFile(this.context);
      
      // Load configuration from SharePoint
      const config: IMonarchNavConfig = await MonarchNavConfigService.loadConfig(this.context);
      
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
      }

    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    }

    return Promise.resolve();
  }

  public onDispose(): void {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
