import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton } from "@fluentui/react";
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
            
            /* Theme Modal Two-Column Layout */
            .theme-modal-two-column {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 24px;
            }
            
            @media (max-width: 800px) {
                .theme-modal-two-column {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
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
                // TODO: Integrate a professional notification/toast system here
                console.error('Failed to save navigation changes. Please try again.');
            }
        }
    );

    // UI state
    const [isSettingsCalloutVisible, setIsSettingsCalloutVisible] = React.useState(false);
    const [isEditActionsVisible, setIsEditActionsVisible] = React.useState(false);

    const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
    const navigationButtonRef = React.useRef<HTMLButtonElement>(null);

    // State for dropdown menus
    const [dropdownStates, setDropdownStates] = React.useState<{[key: number]: boolean}>({});
    const [dropdownTimeouts, setDropdownTimeouts] = React.useState<{[key: number]: number}>({});

    // Handle dropdown visibility
    const showDropdown = React.useCallback((parentIndex: number): void => {
        // Clear any existing timeout for this dropdown
        if (dropdownTimeouts[parentIndex]) {
            clearTimeout(dropdownTimeouts[parentIndex]);
        }
        
        setDropdownStates(prev => ({ ...prev, [parentIndex]: true }));
    }, [dropdownTimeouts]);

    const hideDropdown = React.useCallback((parentIndex: number): void => {
        // Set a timeout to hide the dropdown (allows moving mouse to dropdown)
        const timeout = window.setTimeout(() => {
            setDropdownStates(prev => ({ ...prev, [parentIndex]: false }));
        }, 150);
        
        setDropdownTimeouts(prev => ({ ...prev, [parentIndex]: timeout }));
    }, []);

    const cancelHideDropdown = React.useCallback((parentIndex: number): void => {
        // Cancel the hide timeout when mouse re-enters
        if (dropdownTimeouts[parentIndex]) {
            clearTimeout(dropdownTimeouts[parentIndex]);
        }
    }, [dropdownTimeouts]);

    // Helper function to apply SharePoint header visibility
    const applySpHeaderVisibility = React.useCallback((visible: boolean): void => {
        const possibleIds = [
            'spSiteHeader', 
            'spHeader', 
            // 'SuiteNavWrapper'
        ];
        
        
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
            console.warn('SharePoint header element not found with any of the expected IDs:', possibleIds);
        }, 500);
    }, []);

    // Function to fetch items from list (placeholder)
    const fetchItemsFromList = React.useCallback((): void => {
        // Placeholder for list fetching logic
    }, []);

    // Handle save button click
    const handleSave = React.useCallback(async (): Promise<void> => {
        try {
            await saveConfig();
            setIsSettingsCalloutVisible(false);
            navigationManager.closeDialog(); // Close navigation dialog if open
            // TODO: Integrate a professional notification/toast system here
            console.log("Settings saved successfully!");
        } catch {
            // TODO: Integrate a professional notification/toast system here
            console.error("Error saving settings. Please try again.");
        }
    }, [saveConfig, navigationManager]);

    // Handle cancel button click
    const handleCancel = React.useCallback((): void => {
        resetConfig();
        setIsSettingsCalloutVisible(false);
        navigationManager.closeDialog(); // Close navigation dialog if open
    }, [resetConfig, navigationManager]);

    // Handle reload button click
    const handleReload = React.useCallback(async (): Promise<void> => {
        try {
            await reloadConfig();
            navigationManager.closeDialog(); // Close navigation dialog if open
        } catch {
            // TODO: Integrate a professional notification/toast system here
            console.error("Error reloading configuration. Please try again.");
        }
    }, [reloadConfig, navigationManager]);

    // Apply SharePoint header visibility when config changes
    React.useEffect(() => {
        applySpHeaderVisibility(config.themes.is_sp_header);
    }, [config.themes.is_sp_header, applySpHeaderVisibility]);

    // Mount effect
    React.useEffect(() => {
        fetchItemsFromList();
    }, [fetchItemsFromList]);

    // Extract values from config for easier access
    const backgroundColor = config.themes.backgroundColor;
    const textColor = config.themes.textColor;
    const padding_top_bottom = config.themes.padding_top_bottom;
    const fontSize = parseInt(config.themes.items_font_size.replace('px', ''));
    const fontStyle = config.themes.fontStyle || "normal";
    const homeUrl = props.context.pageContext.web.absoluteUrl;

    // Process navigation items to replace empty links with home URL
    const processedItems = React.useMemo(() => {
        return config.items.map(item => {
            // If link is empty, use SharePoint home URL
            if (!item.link || item.link === "") {
                return {
                    ...item,
                    link: homeUrl
                };
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
                    {/* Only one Settings and Add Navigation button group to the left of the logo */}
                    {isEditActionsVisible && (
                        <>
                            <button
                                ref={settingsButtonRef}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: textColor,
                                    fontSize: 18,
                                    cursor: "pointer",
                                    paddingTop: padding_top_bottom ? parseInt(padding_top_bottom) : 8,
                                    paddingBottom: padding_top_bottom ? parseInt(padding_top_bottom) : 8,
                                    paddingLeft: 12,
                                    paddingRight: 12,
                                    borderRadius: 4,
                                    transition: "background-color 0.2s ease",
                                }}
                                title="Settings"
                                aria-label="Settings"
                                onClick={() => setIsSettingsCalloutVisible(!isSettingsCalloutVisible)}
                            >
                                <span role="img" aria-label="Settings">⚙️</span>
                            </button>
                            <button
                                ref={navigationButtonRef}
                                style={{
                                    background: "#fff",
                                    color: "#0078d4",
                                    border: "none",
                                    fontSize: 16,
                                    cursor: "pointer",
                                    padding: "4px 4px",
                                    borderRadius: 4,
                                    marginRight: 4,
                                    transition: "background-color 0.2s ease",
                                }}
                                title="Add Navigation"
                                aria-label="Add Navigation"
                                onClick={navigationManager.openAddDialog}
                            >
                                Add Navigation
                            </button>
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
                        <>
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
                        </>
                    )}
                    <div
                        id="monarchMenuItems"
                        style={{
                            color: textColor,
                            fontSize: fontSize,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: 4, // Added padding to menu items container
                        }}
                    >
                        {/* Enhanced hierarchical navigation with dropdown menus */}
                        {processedItems.map((item, parentIndex) => (
                            <div 
                                key={`nav-item-${parentIndex}`}
                                style={{ position: 'relative', display: 'inline-block' }}
                                onMouseEnter={() => {
                                    if (item.children && item.children.length > 0) {
                                        cancelHideDropdown(parentIndex);
                                        showDropdown(parentIndex);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (item.children && item.children.length > 0) {
                                        hideDropdown(parentIndex);
                                    }
                                }}
                            >
                                {/* Parent Item */}
                                <button
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: textColor,
                                        fontSize: fontSize,
                                        fontWeight: fontStyle === "bold" ? "bold" : "normal",
                                        fontStyle: fontStyle === "italic" ? "italic" : "normal",
                                        cursor: "pointer",
                                        padding: "6px",
                                        borderRadius: 4,
                                        transition: "background-color 0.2s ease",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                    title={item.description || item.name}
                                    aria-label={item.name}
                                    onClick={(e) => {
                                        if (isEditActionsVisible) {
                                            // In edit mode, clicking opens edit dialog
                                            e.preventDefault();
                                            navigationManager.openEditDialog(parentIndex, config.items[parentIndex]);
                                        } else {
                                            // Normal mode - if has children, don't navigate immediately
                                            if (item.children && item.children.length > 0) {
                                                e.preventDefault();
                                                // Toggle dropdown on click for touch devices
                                                if (dropdownStates[parentIndex]) {
                                                    hideDropdown(parentIndex);
                                                } else {
                                                    showDropdown(parentIndex);
                                                }
                                            } else if (item.link) {
                                                // Navigate only if no children and has link
                                                if (item.target === '_blank') {
                                                    window.open(item.link, '_blank');
                                                } else {
                                                    window.location.href = item.link;
                                                }
                                            }
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isEditActionsVisible) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isEditActionsVisible) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {/* Parent icon and text */}
                                    {item.children && item.children.length > 0 && (
                                        <span style={{ marginRight: 4, fontSize: 12 }}>▼</span>
                                    )}
                                    {item.name}
                                    {isEditActionsVisible && (
                                        <>
                                            <IconButton
                                                iconProps={{ iconName: "Edit" }}
                                                title="Edit Parent"
                                                ariaLabel="Edit Parent"
                                                styles={{
                                                    root: {
                                                        fontSize: 12,
                                                        color: "white",
                                                        background: "gray",
                                                        borderRadius: 3,
                                                        marginLeft: 6,
                                                        padding: 2,
                                                        height: 20,
                                                        width: 20,
                                                        minWidth: 20,
                                                        minHeight: 20,
                                                        lineHeight: "16px"
                                                    },
                                                    icon: {
                                                        fontSize: 12
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigationManager.openEditDialog(parentIndex, config.items[parentIndex]);
                                                }}
                                            />
                                            <IconButton
                                                iconProps={{ iconName: "Delete" }}
                                                title="Delete Parent"
                                                ariaLabel="Delete Parent"
                                                styles={{
                                                    root: {
                                                        fontSize: 12,
                                                        color: "#d13438",
                                                        background: "transparent",
                                                        borderRadius: 3,
                                                        marginLeft: 4,
                                                        padding: 2,
                                                        height: 20,
                                                        width: 20,
                                                        minWidth: 20,
                                                        minHeight: 20,
                                                        lineHeight: "16px"
                                                    },
                                                    icon: {
                                                        fontSize: 12
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Are you sure you want to delete parent item '${item.name}'?`)) {
                                                        navigationManager.deleteParentItem(parentIndex);
                                                    }
                                                }}
                                            />
                                        </>
                                    )}
                                </button>
                                
                                {/* Dropdown Menu for Child Items */}
                                {item.children && item.children.length > 0 && dropdownStates[parentIndex] && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            backgroundColor: backgroundColor, // Use theme background
                                            border: `1px solid rgba(255,255,255,0.2)`,
                                            borderRadius: 4,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                            minWidth: 200,
                                            zIndex: 1001,
                                            overflow: 'hidden',
                                            marginTop: 2,
                                            padding: 4
                                        }}
                                        onMouseEnter={() => cancelHideDropdown(parentIndex)}
                                        onMouseLeave={() => hideDropdown(parentIndex)}
                                    >
                                        {item.children.map((childItem, childIndex) => (
                                            <button
                                                key={`child-${parentIndex}-${childIndex}`}
                                                style={{
                                                    width: '100%',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: textColor, // Use theme text color
                                                    fontSize: fontSize - 2,
                                                    cursor: 'pointer',
                                                    padding: '10px 16px',
                                                    textAlign: 'left',
                                                    transition: 'background-color 0.2s ease',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    borderBottom: childIndex < item.children!.length - 1 ? `1px solid rgba(255,255,255,0.1)` : 'none',
                                                    borderRadius: 0,
                                                    minHeight: 40,
                                                    position: 'relative',
                                                }}
                                                title={childItem.description || childItem.name}
                                                aria-label={`${item.name} - ${childItem.name}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isEditActionsVisible) {
                                                        navigationManager.openEditChildDialog(parentIndex, childIndex);
                                                    } else {
                                                        if (childItem.link) {
                                                            if (childItem.target === '_blank') {
                                                                window.open(childItem.link, '_blank');
                                                            } else {
                                                                window.location.href = childItem.link;
                                                            }
                                                        }
                                                        setDropdownStates(prev => ({ ...prev, [parentIndex]: false }));
                                                    }
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    <span>{childItem.name}</span>
                                                    {isEditActionsVisible && (
                                                        <>
                                                            <IconButton
                                                                iconProps={{ iconName: "Edit" }}
                                                                title="Edit Child"
                                                                ariaLabel="Edit Child"
                                                                styles={{
                                                                    root: {
                                                                        fontSize: 12,
                                                                        color: "white",
                                                                        background: "gray",
                                                                        borderRadius: 3,
                                                                        marginLeft: 6,
                                                                        padding: 2,
                                                                        height: 20,
                                                                        width: 20,
                                                                        minWidth: 20,
                                                                        minHeight: 20,
                                                                        lineHeight: "16px"
                                                                    },
                                                                    icon: {
                                                                        fontSize: 12
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigationManager.openEditChildDialog(parentIndex, childIndex);
                                                                }}
                                                            />
                                                            <IconButton
                                                                iconProps={{ iconName: "Delete" }}
                                                                title="Delete Child"
                                                                ariaLabel="Delete Child"
                                                                styles={{
                                                                    root: {
                                                                        fontSize: 12,
                                                                        color: "#d13438",
                                                                        background: "transparent",
                                                                        borderRadius: 3,
                                                                        marginLeft: 4,
                                                                        padding: 2,
                                                                        height: 20,
                                                                        width: 20,
                                                                        minWidth: 20,
                                                                        minHeight: 20,
                                                                        lineHeight: "16px"
                                                                    },
                                                                    icon: {
                                                                        fontSize: 12
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm(`Are you sure you want to delete "${childItem.name}"?`)) {
                                                                        navigationManager.deleteChildItem(parentIndex, childIndex);
                                                                    }
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                {/* Description below name, SharePoint style */}
                                                {childItem.description && childItem.description.trim() !== '' && (
                                                    <div style={{
                                                        fontSize: `${fontSize - 2}px`,
                                                        color: textColor, // Use theme text color for description
                                                        marginLeft: 22,
                                                        marginTop: 2,
                                                        whiteSpace: 'normal',
                                                        lineHeight: 1.3,
                                                        maxWidth: 260,
                                                        opacity: 0.85
                                                    }}>
                                                        {childItem.description}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <IconButton
                        iconProps={{ iconName: "Edit" }}
                        title="Edit"
                        ariaLabel="Edit"
                        styles={{
                            root: { color: "white", background: "gray" },
                        }}
                        onClick={() => {
                            setIsEditActionsVisible(!isEditActionsVisible);
                            setIsSettingsCalloutVisible(false);
                        }}
                    />
                </div>
                {/* right side empty for now */}
                <div />
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
