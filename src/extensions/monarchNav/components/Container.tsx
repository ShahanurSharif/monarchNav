import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, DefaultButton, IButton } from "@fluentui/react";
import { useConfigManager } from "../hooks/useConfigManager";
import { useNavigationManager } from "../hooks/useNavigationManager";
import { MonarchNavConfigService } from "../MonarchNavConfigService";
import { ThemeModal } from "./ThemeModal";
import { NavModal } from "./NavModal";

const Container: React.FC<IContainerProps> = (props) => {
    // Inject CSS for dialog styling
    React.useEffect(() => {
        const style = document.createElement('style');
        style.id = 'monarch-nav-dialog-styles';
        style.textContent = `
            .monarch-nav-dialog .ms-Modal-main {
                max-width: 591px !important;
                width: 591px !important;
            }
            
            @media (max-width: 639px) {
                .monarch-nav-dialog .ms-Modal-main {
                    max-width: 90vw !important;
                    width: 90vw !important;
                }
            }
        `;
        
        // Only add if not already present
        if (!document.getElementById('monarch-nav-dialog-styles')) {
            document.head.appendChild(style);
        }
        
        return () => {
            // Cleanup on unmount
            const existingStyle = document.getElementById('monarch-nav-dialog-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    // Use config manager hook for state management
    const {
        config,
        isSaving,
        isLoading,
        error,
        hasUnsavedChanges,
        updateTheme,
        saveConfig,
        reloadConfig,
        resetConfig,
        updateConfig,
        markAsSaved
    } = useConfigManager(props.context, props.config);

    // Navigation items management with auto-save
    const navigationManager = useNavigationManager(
        config.items,
        async (newItems) => {
            const newConfig = {
                ...config,
                items: newItems
            };
            // Auto-save navigation changes immediately
            try {
                markAsSaved(); // Mark as saved BEFORE updateConfig to avoid race condition
                updateConfig(newConfig);
                // Save the new config directly to avoid state timing issues
                await MonarchNavConfigService.saveConfig(props.context, newConfig);
                console.log('Navigation changes auto-saved successfully');
            } catch (error) {
                console.error('Failed to auto-save navigation changes:', error);
            }
        }
    );

    // UI state
    const [isSettingsCalloutVisible, setIsSettingsCalloutVisible] = React.useState(false);
    const [isEditActionsVisible, setIsEditActionsVisible] = React.useState(false);

    const settingsButtonRef = React.useRef<IButton>(null);
    const navigationButtonRef = React.useRef<IButton>(null);

    // State for dropdown menus
    const [dropdownStates, setDropdownStates] = React.useState<{[key: number]: boolean}>({});

    // Handle dropdown visibility
    const showDropdown = React.useCallback((parentIndex: number): void => {
        setDropdownStates(prev => ({ ...prev, [parentIndex]: true }));
    }, []);

    const hideDropdown = React.useCallback((parentIndex: number): void => {
        setDropdownStates(prev => ({ ...prev, [parentIndex]: false }));
    }, []);

    // Helper function to apply SharePoint header visibility
    const applySpHeaderVisibility = React.useCallback((visible: boolean): void => {
        const possibleIds = ['spSiteHeader', 'spHeader'];
        
        for (const id of possibleIds) {
            const spHeader = document.getElementById(id);
            if (spHeader) {
                spHeader.style.display = visible ? "" : "none";
                console.log(`Applied SharePoint header visibility (${visible}) to element: ${id}`);
                return;
            }
        }
        
        setTimeout(() => {
            for (const id of possibleIds) {
                const spHeader = document.getElementById(id);
                if (spHeader) {
                    spHeader.style.display = visible ? "" : "none";
                    console.log(`Applied SharePoint header visibility (${visible}) to element: ${id} (delayed)`);
                    return;
                }
            }
        }, 500);
    }, []);

    // Helper function to apply Suite Navigation visibility
    const applySuiteNavVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('SuiteNavWrapper');
        if (element) {
            element.style.display = visible ? "" : "none";
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('SuiteNavWrapper');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                }
            }, 500);
        }
    }, []);

    // Helper function to apply Command Bar visibility
    const applyCommandBarVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('spCommandBar');
        if (element) {
            element.style.display = visible ? "" : "none";
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('spCommandBar');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                }
            }, 500);
        }
    }, []);

    // Helper function to apply App Bar visibility
    const applyAppBarVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('sp-appBar');
        if (element) {
            element.style.display = visible ? "" : "none";
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('sp-appBar');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                }
            }, 500);
        }
    }, []);

    // Handle save button click
    const handleSave = React.useCallback(async (): Promise<void> => {
        try {
            await saveConfig();
            setIsSettingsCalloutVisible(false);
            navigationManager.closeDialog();
        } catch {
            console.error("Error saving settings. Please try again.");
        }
    }, [saveConfig, navigationManager]);

    // Handle cancel button click
    const handleCancel = React.useCallback((): void => {
        resetConfig();
        setIsSettingsCalloutVisible(false);
        navigationManager.closeDialog();
    }, [resetConfig, navigationManager]);

    // Handle reload button click
    const handleReload = React.useCallback(async (): Promise<void> => {
        try {
            await reloadConfig();
            navigationManager.closeDialog();
        } catch {
            console.error("Error reloading configuration. Please try again.");
        }
    }, [reloadConfig, navigationManager]);

    // Apply SharePoint element visibility when config changes
    React.useEffect(() => {
        applySpHeaderVisibility(config.themes.is_sp_header);
    }, [config.themes.is_sp_header, applySpHeaderVisibility]);

    React.useEffect(() => {
        applySuiteNavVisibility(config.themes.is_suite_nav);
    }, [config.themes.is_suite_nav, applySuiteNavVisibility]);

    React.useEffect(() => {
        applyCommandBarVisibility(config.themes.is_command_bar);
    }, [config.themes.is_command_bar, applyCommandBarVisibility]);

    React.useEffect(() => {
        applyAppBarVisibility(config.themes.is_app_bar);
    }, [config.themes.is_app_bar, applyAppBarVisibility]);

    // Extract values from config for easier access
    const backgroundColor = config.themes.backgroundColor;
    const textColor = config.themes.textColor;
    const padding_top_bottom = config.themes.padding_top_bottom;
    const fontSize = parseInt(config.themes.items_font_size.replace('px', ''));
    const homeUrl = props.context.pageContext.web.absoluteUrl;

    // Process navigation items to replace empty links with home URL
    const processedItems = React.useMemo(() => {
        return config.items.map(item => {
            if (!item.link || item.link === "") {
                return { ...item, link: homeUrl };
            }
            return item;
        });
    }, [config.items, homeUrl]);

    return (
        <div>
            <div
                id="monarchMainNavHeader"
                style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                    paddingTop: padding_top_bottom ? parseInt(padding_top_bottom) : 0,
                    paddingBottom: padding_top_bottom ? parseInt(padding_top_bottom) : 0,
                    paddingLeft: 12,
                    paddingRight: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1000,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
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
                    {/* Settings and Add Navigation buttons */}
                    {isEditActionsVisible && (
                        <>
                            <IconButton
                                componentRef={settingsButtonRef}
                                iconProps={{ iconName: "Settings" }}
                                title="Navigation Theme Settings"
                                onClick={() => setIsSettingsCalloutVisible(!isSettingsCalloutVisible)}
                                styles={{
                                    root: { color: textColor }
                                }}
                            />
                            <DefaultButton
                                componentRef={navigationButtonRef}
                                text="Add Navigation"
                                iconProps={{ iconName: "list" }}
                                title="Add Navigation Item"
                                onClick={navigationManager.openAddDialog}
                                styles={{
                                    root: { 
                                        marginLeft: 8,
                                        backgroundColor: "#f3f2f1",
                                        border: "1px solid #d2d0ce",
                                        color: "#323130"
                                    }
                                }}
                            />
                        </>
                    )}
                    
                    {/* Logo */}
                    <img
                        src={config.themes.logoUrl || "/SiteAssets/MonarchNav.png"}
                        alt="Logo"
                        style={{
                            height: config.themes.logoSize || "40px",
                            width: "auto",
                            marginRight: 16,
                            background: "transparent"
                        }}
                    />
                    
                    {isEditActionsVisible && (
                        <ThemeModal
                            isOpen={isSettingsCalloutVisible}
                            onDismiss={() => setIsSettingsCalloutVisible(false)}
                            config={config}
                            updateTheme={updateTheme}
                            handleSave={handleSave}
                            handleCancel={handleCancel}
                            handleReload={handleReload}
                            hasUnsavedChanges={hasUnsavedChanges}
                            isSaving={isSaving}
                            isLoading={isLoading}
                            error={error}
                            backgroundColor={backgroundColor}
                            textColor={textColor}
                            fontSize={fontSize}
                        />
                    )}
                    
                    {/* Navigation Items */}
                    <div
                        id="monarchMenuItems"
                        style={{
                            color: textColor,
                            fontSize: fontSize,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 8px",
                        }}
                    >
                        {processedItems.map((item, parentIndex) => (
                            <div 
                                key={`nav-item-${parentIndex}`}
                                style={{ position: "relative" }}
                                onMouseEnter={() => item.children && showDropdown(parentIndex)}
                                onMouseLeave={() => item.children && hideDropdown(parentIndex)}
                            >
                                <a
                                    href={item.link}
                                    target={item.target}
                                    title={item.description}
                                    style={{
                                        color: textColor,
                                        textDecoration: "none",
                                        padding: "6px 12px",
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        cursor: "pointer",
                                        transition: "background-color 0.2s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                >
                                    {item.name}
                                </a>

                                {/* Simple Dropdown Menu */}
                                {item.children && dropdownStates[parentIndex] && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            backgroundColor: "white",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                            borderRadius: 4,
                                            padding: 8,
                                            minWidth: 200,
                                            zIndex: 1001,
                                        }}
                                        onMouseEnter={() => showDropdown(parentIndex)}
                                        onMouseLeave={() => hideDropdown(parentIndex)}
                                    >
                                        {item.children.map((child, childIndex) => (
                                            <div key={`child-${parentIndex}-${childIndex}`} style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "space-between",
                                                padding: "4px 0"
                                            }}>
                                                <a
                                                    href={child.link}
                                                    target={child.target}
                                                    title={child.description}
                                                    style={{
                                                        color: "#323130",
                                                        textDecoration: "none",
                                                        padding: "8px 12px",
                                                        borderRadius: 2,
                                                        flex: 1,
                                                        fontSize: fontSize - 2
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = "#f3f2f1";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = "transparent";
                                                    }}
                                                >
                                                    {child.name}
                                                </a>
                                                {isEditActionsVisible && (
                                                    <div style={{ display: "flex", gap: 4 }}>
                                                        <IconButton
                                                            iconProps={{ iconName: "Edit" }}
                                                            title="Edit item"
                                                            onClick={() => navigationManager.openEditChildDialog(parentIndex, childIndex)}
                                                            styles={{ 
                                                                root: { 
                                                                    width: 24, 
                                                                    height: 24,
                                                                    color: "#605e5c"
                                                                }
                                                            }}
                                                        />
                                                        <IconButton
                                                            iconProps={{ iconName: "Delete" }}
                                                            title="Delete item"
                                                            onClick={() => navigationManager.deleteChildItem(parentIndex, childIndex)}
                                                            styles={{ 
                                                                root: { 
                                                                    width: 24, 
                                                                    height: 24,
                                                                    color: "#d13438"
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Edit actions for parent items */}
                                {isEditActionsVisible && (
                                    <div style={{ 
                                        position: "absolute", 
                                        right: -60, 
                                        top: "50%", 
                                        transform: "translateY(-50%)",
                                        display: "flex",
                                        gap: 4
                                    }}>
                                        <IconButton
                                            iconProps={{ iconName: "Edit" }}
                                            title="Edit item"
                                            onClick={() => navigationManager.openEditDialog(parentIndex, processedItems[parentIndex])}
                                        />
                                        <IconButton
                                            iconProps={{ iconName: "Delete" }}
                                            title="Delete item"
                                            onClick={() => navigationManager.deleteParentItem(parentIndex)}
                                            styles={{ 
                                                root: { color: "#d13438" }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side: Edit toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <IconButton
                        iconProps={{ iconName: isEditActionsVisible ? "Cancel" : "Edit" }}
                        title={isEditActionsVisible ? "Exit Edit Mode" : "Enter Edit Mode"}
                        onClick={() => setIsEditActionsVisible(!isEditActionsVisible)}
                        styles={{
                            root: { color: textColor }
                        }}
                    />
                    {isEditActionsVisible && (
                        <span style={{ fontSize: 14, color: textColor }}>Close</span>
                    )}
                </div>
            </div>

            {/* Navigation Modal */}
            <NavModal 
                isOpen={navigationManager.isCalloutVisible}
                onDismiss={navigationManager.cancelEdit}
                navigationManager={navigationManager}
            />
        </div>
    );
};

export default Container;
