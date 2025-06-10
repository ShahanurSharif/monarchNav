import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, Callout, Toggle, ColorPicker } from "@fluentui/react";
import { MonarchNavConfigService, IMonarchNavConfig } from "../MonarchNavConfigService";

export interface IReactItemState {
    containerItems: {
        Title: string;
    }[];
}

export default class Container extends React.Component<
    IContainerProps,
    IReactItemState & {
        showEditActions: boolean;
        showSettingsCallout: boolean;
        spHeaderVisible: boolean;
        monarchBgColor: string;
        monarchFontColor: string;
        monarchFontSize: number; // <-- Add font size to state
    }
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
            spHeaderVisible: props.config?.themes?.is_sp_header ?? false,
            monarchBgColor: props.config?.themes?.backgroundColor ?? "#0078d4",
            monarchFontColor: props.config?.themes?.textColor ?? "#ffffff",
            monarchFontSize: props.config?.themes?.items_font_size 
                ? parseInt(props.config.themes.items_font_size.replace('px', '')) 
                : 18,
        };
    }
    public componentDidMount(): void {
        // Apply SharePoint header visibility based on configuration
        this._applySpHeaderVisibility(this.state.spHeaderVisible);
        this.fetchItemsFromList();
    }
    private _setSpHeaderVisibility = (visible: boolean): void => {
        this._applySpHeaderVisibility(visible);
        this.setState({ spHeaderVisible: visible });
    };

    private _applySpHeaderVisibility = (visible: boolean): void => {
        // Try multiple possible SharePoint header element IDs
        const possibleIds = ['spSiteHeader', 'spHeader', 'SuiteNavWrapper'];
        
        for (const id of possibleIds) {
            const spHeader = document.getElementById(id);
            if (spHeader) {
                spHeader.style.display = visible ? "" : "none";
                console.log(`Applied SharePoint header visibility (${visible}) to element: ${id}`);
                return;
            }
        }
        
        // If no element found immediately, try with a delay
        setTimeout(() => {
            for (const id of possibleIds) {
                const spHeader = document.getElementById(id);
                if (spHeader) {
                    spHeader.style.display = visible ? "" : "none";
                    console.log(`Applied SharePoint header visibility (${visible}) to element: ${id} (delayed)`);
                    return;
                }
            }
            console.warn('SharePoint header element not found with any of the expected IDs:', possibleIds);
        }, 500);
    };

    /**
     * Handle save button click - Write current state to SharePoint
     */
    private _handleSave = async (): Promise<void> => {
        try {
            const updatedConfig: IMonarchNavConfig = {
                themes: {
                    backgroundColor: this.state.monarchBgColor,
                    textColor: this.state.monarchFontColor,
                    is_sp_header: this.state.spHeaderVisible,
                    items_font_size: `${this.state.monarchFontSize}px`
                },
                items: this.props.config?.items ?? []
            };

            await MonarchNavConfigService.saveConfig(this.props.context, updatedConfig);
            
            alert("Settings saved successfully!");
            this.setState({ showSettingsCallout: false });
            
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Error saving settings. Please try again.");
        }
    };

    /**
     * Handle cancel button click - Load previous values from SharePoint without saving
     */
    private _handleCancel = async (): Promise<void> => {
        try {
            console.log("Loading previous configuration from SharePoint...");
            
            // Load current saved configuration from SharePoint
            const savedConfig = await MonarchNavConfigService.loadConfig(this.props.context);
            
            // Reset UI state to saved configuration values
            this.setState({
                monarchBgColor: savedConfig.themes.backgroundColor,
                monarchFontColor: savedConfig.themes.textColor,
                spHeaderVisible: savedConfig.themes.is_sp_header,
                monarchFontSize: parseInt(savedConfig.themes.items_font_size.replace('px', '')),
                showSettingsCallout: false
            });
            
            console.log("Configuration reset to saved values");
            
        } catch (error) {
            console.error("Error loading previous configuration:", error);
            
            // Fallback: Close callout and keep current changes
            alert("Could not load previous settings. Closing settings panel.");
            this.setState({ showSettingsCallout: false });
        }
    };

    public fetchItemsFromList(): void {}
    public render(): React.ReactElement<IContainerProps> {
        const homeUrl = this.props.context.pageContext.web.absoluteUrl;
        return (
            <div>
                <div
                    id="monarchMainNavHeader"
                    style={{
                        backgroundColor: this.state.monarchBgColor,
                        color: this.state.monarchFontColor,
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
                        id="monarchMenuControls"
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
                                        color: this.state.monarchFontColor,
                                        fontSize: 18,
                                        cursor: "pointer",
                                        padding: "8px 8px",
                                        borderRadius: 4,
                                        transition:
                                            "background-color 0.2s ease",
                                    }}
                                    title="Settings"
                                    aria-label="Settings"
                                    onClick={() => {
                                        this.setState({
                                            showSettingsCallout:
                                                !this.state.showSettingsCallout,
                                        });
                                    }}
                                >
                                    <span role="img" aria-label="Settings">
                                        ⚙️
                                    </span>
                                </button>
                                {this.state.showSettingsCallout && (
                                    <Callout
                                        target={this.settingsButtonRef.current}
                                        onDismiss={() =>
                                            this.setState({
                                                showSettingsCallout: false,
                                            })
                                        }
                                        setInitialFocus
                                        styles={{
                                            root: {
                                                maxWidth: 320,
                                                padding: 16,
                                                boxShadow:
                                                    "0 2px 4px rgba(0,0,0,0.1)",
                                            },
                                        }}
                                    >
                                        {/* callout Settings content */}
                                        <Toggle
                                            label="Show SharePoint Header"
                                            checked={this.state.spHeaderVisible}
                                            onChange={(_e, checked) =>
                                                this._setSpHeaderVisibility(
                                                    !!checked
                                                )
                                            }
                                        />
                                        {/* Background color picker */}
                                        <div style={{ marginTop: 16 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                Header Background Color
                                            </div>
                                            <ColorPicker
                                                color={
                                                    this.state.monarchBgColor
                                                }
                                                onChange={(
                                                    _ev,
                                                    colorObj: { str: string }
                                                ) => {
                                                    this.setState({
                                                        monarchBgColor:
                                                            colorObj.str,
                                                    });
                                                }}
                                                alphaType="none"
                                                showPreview={true}
                                            />
                                        </div>
                                        {/* Font color picker */}
                                        <div style={{ marginTop: 16 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                Menu Items Font Color
                                            </div>
                                            <ColorPicker
                                                color={
                                                    this.state.monarchFontColor
                                                }
                                                onChange={(
                                                    _ev,
                                                    colorObj: { str: string }
                                                ) => {
                                                    this.setState({
                                                        monarchFontColor:
                                                            colorObj.str,
                                                    });
                                                }}
                                                alphaType="none"
                                                showPreview={true}
                                            />
                                        </div>
                                        {/* Font size slider */}
                                        <div style={{ marginTop: 16 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                Menu Items Font Size
                                            </div>
                                            <input
                                                type="range"
                                                min={12}
                                                max={32}
                                                step={1}
                                                value={this.state.monarchFontSize}
                                                onChange={e =>
                                                    this.setState({
                                                        monarchFontSize: Number(e.target.value),
                                                    })
                                                }
                                                style={{ width: "100%" }}
                                            />
                                            <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
                                                {this.state.monarchFontSize}px
                                            </div>
                                        </div>
                                        {/* Action buttons */}
                                        <div style={{ 
                                            marginTop: 20, 
                                            display: "flex", 
                                            gap: 8, 
                                            justifyContent: "flex-end" 
                                        }}>
                                            <button
                                                style={{
                                                    backgroundColor: "#f3f2f1",
                                                    color: "#323130",
                                                    border: "1px solid #d2d0ce",
                                                    borderRadius: 2,
                                                    padding: "6px 16px",
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    fontWeight: 400
                                                }}
                                                onClick={this._handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                style={{
                                                    backgroundColor: "#0078d4",
                                                    color: "#ffffff",
                                                    border: "1px solid #0078d4",
                                                    borderRadius: 2,
                                                    padding: "6px 16px",
                                                    fontSize: 14,
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                                onClick={this._handleSave}
                                            >
                                                Save
                                            </button>
                                        </div>
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
                                        transition:
                                            "background-color 0.2s ease",
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
                        <div
                            id="monarchMenuItems"
                            style={{
                                color: this.state.monarchFontColor,
                                fontSize: this.state.monarchFontSize, // <-- Apply font size here
                            }}
                        >
                            <button
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: this.state.monarchFontColor,
                                    fontSize: this.state.monarchFontSize, // <-- Apply font size to button
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
                        </div>
                        <IconButton
                            iconProps={{ iconName: "Edit" }}
                            title="Edit"
                            ariaLabel="Edit"
                            styles={{
                                root: { color: "white", background: "none" },
                            }}
                            onClick={() => {
                                this.setState({
                                    showEditActions:
                                        !this.state.showEditActions,
                                    showSettingsCallout: false,
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
