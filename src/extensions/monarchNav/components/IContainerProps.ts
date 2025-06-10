import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import { IMonarchNavConfig } from '../MonarchNavConfigService';

export interface IContainerProps {
    context: ApplicationCustomizerContext;
    config: IMonarchNavConfig;
}