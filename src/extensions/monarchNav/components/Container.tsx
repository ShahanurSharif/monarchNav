import * as React from 'react';
// import { Fabric } from '@fluentui/react';
// import { escape } from '@microsoft/sp-lodash-subset';

// import {
//     SPHttpClient,
//     SPHttpClientConfiguration,
//     SPHttpClientResponse,
//     ISPHttpClientOptions
// } from '@microsoft/sp-http';
import { IContainerProps } from './IContainerProps';

export interface IReactItemState {
    containerItems: {
        Title: string;
    }[];
}

export default class Container extends React.Component<
IContainerProps,
IReactItemState
> {
    constructor(props: IContainerProps){
        super(props);
        this.state = {
            containerItems: [
                {
                    Title: ""
                }
            ]
        };
    }
    public componentDidMount(): void {
        this.fetchItemsFromList();
    }
    public fetchItemsFromList(): void {

    }
    public render(): React.ReactElement<IContainerProps> {
        return <div>div via reactive component</div>
    }   
}