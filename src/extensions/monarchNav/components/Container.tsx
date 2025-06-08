import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, Callout, Toggle } from "@fluentui/react";

export interface IReactItemState {
    containerItems: {
        Title: string;
    }[];
}

export default class Container extends React.Component<
    IContainerProps,
    IReactItemState & { showEditActions: boolean; showSettingsCallout: boolean; spHeaderVisible: boolean }
> {
    private settingsButtonRef = React.createRef<HTMLButtonElement>();
    constructor(props: IContainerProps) {
        super(props);
        this.state = {
            containerItems: [
                {
                    Title: "",
                },
            ],
            showEditActions: false,
            showSettingsCallout: false,
            spHeaderVisible: false, // default is false
        };
    }
    public componentDidMount(): void {
        // Always hide spSiteHeader on mount (default false)
        const spHeader = document.getElementById('spSiteHeader');
        if (spHeader) {
            spHeader.style.display = 'none';
        } else {
            setTimeout(() => {
                const delayedHeader = document.getElementById('spSiteHeader');
                if (delayedHeader) {
                    delayedHeader.style.display = 'none';
                }
            }, 500);
        }
        this.fetchItemsFromList();
    }
    private _setSpHeaderVisibility = (visible: boolean): void => {
        const spHeader = document.getElementById('spSiteHeader');
        if (spHeader) {
            spHeader.style.display = visible ? '' : 'none';
        }
        this.setState({ spHeaderVisible: visible });
    };
    public fetchItemsFromList(): void {}
    public render(): React.ReactElement<IContainerProps> {
        const homeUrl = this.props.context.pageContext.web.absoluteUrl;
        return (
            <div>
                <div
                    style={{
                        backgroundColor: "#0078d4",
                        color: "white",
                        padding: "12px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        position: "relative",
                        zIndex: 1000,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        fontFamily:
                            "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                    }}
                >
                    {/* menu items and edit button */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        {this.state.showEditActions && (
                            <>
                                <button
                                    ref={this.settingsButtonRef}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        fontSize: 18,
                                        cursor: "pointer",
                                        padding: "8px 8px",
                                        borderRadius: 4,
                                        transition: "background-color 0.2s ease",
                                    }}
                                    title="Settings"
                                    aria-label="Settings"
                                    onClick={() => {
                                        this.setState({ showSettingsCallout: !this.state.showSettingsCallout });
                                    }}
                                >
                                    <span role="img" aria-label="Settings">
                                        ⚙️
                                    </span>
                                </button>
                                {this.state.showSettingsCallout && (
                                    <Callout
                                        target={this.settingsButtonRef.current}
                                        onDismiss={() => this.setState({ showSettingsCallout: false })}
                                        setInitialFocus
                                        styles={{
                                            root: {
                                                maxWidth: 300,
                                                padding: 16,
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            },
                                        }}
                                    >
                                        <Toggle
                                            label="Show SharePoint Header"
                                            checked={this.state.spHeaderVisible}
                                            onChange={(_e, checked) => this._setSpHeaderVisibility(!!checked)}
                                        />
                                    </Callout>
                                )}
                                <button
                                    style={{
                                        background: "#fff",
                                        color: "#0078d4",
                                        border: "none",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        padding: "8px 16px",
                                        borderRadius: 4,
                                        marginRight: 4,
                                        transition: "background-color 0.2s ease",
                                    }}
                                    title="Add/Edit Navigation"
                                    aria-label="Add/Edit Navigation"
                                    onClick={() => {
                                        alert(
                                            "Add/Edit Navigation functionality coming soon!"
                                        );
                                    }}
                                >
                                    Add/Edit Navigation
                                </button>
                            </>
                        )}
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "white",
                                fontSize: 18,
                                fontWeight: 600,
                                cursor: "pointer",
                                padding: "8px 16px",
                                borderRadius: 4,
                                transition: "background-color 0.2s ease",
                            }}
                            title="Home"
                            aria-label="Home"
                            onClick={() => {
                                window.location.href = homeUrl;
                            }}
                        >
                            Home
                        </button>
                        <IconButton
                            iconProps={{ iconName: "Edit" }}
                            title="Edit"
                            ariaLabel="Edit"
                            styles={{ root: { color: "white", background: "none" } }}
                            onClick={() => {
                                this.setState({
                                    showEditActions: !this.state.showEditActions,
                                    showSettingsCallout: false
                                });
                            }}
                        />
                    </div>
                    {/* title in the center */}
                    <span
                        style={{
                            fontSize: 20,
                            fontWeight: 600,
                        }}
                    >
                        MonarchNav
                    </span>
                    {/* right side empty for now */}
                    <div />
                </div>
                {/* <div>div via reactive component</div> */}
            </div>
        );
    }
}
