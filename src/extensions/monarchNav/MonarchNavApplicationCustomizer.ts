import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  PlaceholderName,
  PlaceholderContent
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import Container from './components/Container'
import * as strings from 'MonarchNavApplicationCustomizerStrings';

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

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`).catch(() => {
      /* handle error */
    });

    const element: React.ReactElement = React.createElement(
      Container, 
      {
        context: this.context
      }
    );

    const topPlaceholder = this.context.placeholderProvider.tryCreateContent(
      PlaceholderName.Top
    );
    
    if (topPlaceholder) {
      this._topPlaceholder = topPlaceholder;
      ReactDom.render(
        element,
        topPlaceholder.domElement
      );
    }

    return Promise.resolve();
  }

  public onDispose(): void {
    if (this._topPlaceholder && this._topPlaceholder.domElement) {
      ReactDom.unmountComponentAtNode(this._topPlaceholder.domElement);
    }
  }
}
