import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, Callout, Toggle, ColorPicker } from "@fluentui/react";

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
            spHeaderVisible: false, // default is false
            monarchBgColor: "#0078d4",
            monarchFontColor: "#ffffff",
            monarchFontSize: 18, // <-- Default font size
        };
    }
    public componentDidMount(): void {
        // Always hide spSiteHeader on mount (default false)
        const spHeader = document.getElementById("spSiteHeader");
        if (spHeader) {
            spHeader.style.display = "none";
        } else {
            setTimeout(() => {
                const delayedHeader = document.getElementById("spSiteHeader");
                if (delayedHeader) {
                    delayedHeader.style.display = "none";
                }
            }, 500);
        }
        this.fetchItemsFromList();
    }
    private _setSpHeaderVisibility = (visible: boolean): void => {
        const spHeader = document.getElementById("spSiteHeader");
        if (spHeader) {
            spHeader.style.display = visible ? "" : "none";
        }
        this.setState({ spHeaderVisible: visible });
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
                                                onClick={() => {
                                                    this.setState({
                                                        showSettingsCallout: false
                                                    });
                                                }}
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
                                                onClick={() => {
                                                    // Save functionality will be added later
                                                    alert("Settings saved!");
                                                    this.setState({
                                                        showSettingsCallout: false
                                                    });
                                                }}
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
