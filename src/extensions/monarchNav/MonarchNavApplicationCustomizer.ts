import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'MonarchNavApplicationCustomizerStrings';

const LOG_SOURCE: string = 'MonarchNavApplicationCustomizer';

export interface IMonarchNavApplicationCustomizerProperties {
  testMessage: string;
}

export default class MonarchNavApplicationCustomizer
  extends BaseApplicationCustomizer<IMonarchNavApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // Hide spSiteHeader
    this._hideSiteHeader();
    
    // Create MonarchNav in spTopPlaceholder
    this._createMonarchNav();

    return Promise.resolve();
  }

  private _hideSiteHeader(): void {
    const style = document.createElement('style');
    style.textContent = `
      #spSiteHeader {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  private _createMonarchNav(): void {
    const topPlaceholder = document.getElementById('spTopPlaceholder');
    if (topPlaceholder) {
      const homeUrl = this.context.pageContext.web.absoluteUrl;
      
      topPlaceholder.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background-color: #0078d4; color: white;">
          <a href="${homeUrl}" style="color: white; text-decoration: none; font-weight: bold;">
            🏠 Home
          </a>
          <button id="monarchNavCog" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">
            ⚙️
          </button>
        </div>
      `;

      // Add cog button click handler
      const cogButton = document.getElementById('monarchNavCog');
      if (cogButton) {
        cogButton.addEventListener('click', () => {
          alert('Cog button clicked!');
        });
      }
    }
  }
}
