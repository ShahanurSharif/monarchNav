import * as React from "react";
import { IContainerProps } from "./IContainerProps";

export interface IReactItemState {
    containerItems: {
        Title: string;
    }[];
}

export default class Container extends React.Component<
    IContainerProps,
    IReactItemState
> {
    constructor(props: IContainerProps) {
        super(props);
        this.state = {
            containerItems: [
                {
                    Title: "",
                },
            ],
        };
    }
    public componentDidMount(): void {
        this.fetchItemsFromList();
    }
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
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "white",
                                fontSize: 20,
                                cursor: "pointer",
                                padding: 8,
                                borderRadius: 4,
                                transition: "background-color 0.2s ease",
                            }}
                            title="Edit"
                            aria-label="Edit"
                            onClick={() => {
                                alert(
                                    "MonarchNav Edit\n\nEdit functionality coming soon!"
                            );
                        }}
                    >
                        ✏️
                    </button>
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
