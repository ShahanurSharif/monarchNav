import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, Callout, Toggle, ColorPicker } from "@fluentui/react";
import { useConfigManager } from "../hooks/useConfigManager";
import { useNavigationManager } from "../hooks/useNavigationManager";
import { MonarchNavConfigService } from "../MonarchNavConfigService";
import { NavigationItemForm } from "../components/NavigationItemForm";

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
        const possibleIds = ['spSiteHeader', 'spHeader', 'SuiteNavWrapper'];
        
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
        <div data-testid="monarch-nav-root">
            <div
                id="monarchMainNavHeader"
                style={{
                    backgroundColor: backgroundColor,
                    color: textColor,
                    padding: "12px 20px",
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
                                    padding: "8px 8px",
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
                            {isSettingsCalloutVisible && (
                                <Callout
                                    id="theme_callout"
                                    target={settingsButtonRef.current}
                                    onDismiss={() => setIsSettingsCalloutVisible(false)}
                                    setInitialFocus
                                    styles={{
                                        root: {
                                            maxWidth: 320,
                                            padding: 16,
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                        },
                                    }}
                                >
                                    {/* Loading/Error states */}
                                    {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                                    {isLoading && <div style={{ color: '#0078d4', marginBottom: 8 }}>Loading...</div>}
                                    
                                    {/* SharePoint Header Toggle */}
                                    <Toggle
                                        label="Show SharePoint Header"
                                        checked={config.themes.is_sp_header}
                                        onChange={(_e, checked) => updateTheme('is_sp_header', !!checked)}
                                    />
                                    
                                    {/* Background color picker */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ marginBottom: 4 }}>
                                            Header Background Color
                                        </div>
                                        <ColorPicker
                                            color={backgroundColor}
                                            onChange={(_ev, colorObj: { str: string }) => 
                                                updateTheme('backgroundColor', colorObj.str)
                                            }
                                            alphaType="none"
                                            showPreview={true}
                                        />
                                    </div>
                                    
                                    {/* Font color picker */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ marginBottom: 4 }}>
                                            Menu Items Font Color
                                        </div>
                                        <ColorPicker
                                            color={textColor}
                                            onChange={(_ev, colorObj: { str: string }) => 
                                                updateTheme('textColor', colorObj.str)
                                            }
                                            alphaType="none"
                                            showPreview={true}
                                        />
                                    </div>
                                    
                                    {/* Font size slider */}
                                    <div style={{ marginTop: 16, padding: 15 }}>
                                        <div style={{ marginBottom: 4 }}>
                                            Menu Items Font Size
                                        </div>
                                        <input
                                            type="range"
                                            min={12}
                                            max={32}
                                            step={1}
                                            value={fontSize}
                                            onChange={e => updateTheme('items_font_size', `${e.target.value}px`)}
                                            style={{ width: "100%" }}
                                        />
                                        <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
                                            {fontSize}px
                                        </div>
                                    </div>
                                    
                                    {/* Logo Upload */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ marginBottom: 4 }}>Header Logo</div>
                                        <img
                                            src={config.themes.logoUrl || "/SiteAssets/MonarchNav.png"}
                                            alt="Logo"
                                            style={{
                                                height: config.themes.logoSize || "40px",
                                                width: "auto",
                                                marginBottom: 8,
                                                borderRadius: 4,
                                                background: "#fff",
                                                border: "1px solid #eee"
                                            }}
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ marginBottom: 8 }}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => {
                                                        updateTheme("logoUrl", ev.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        {/* Logo Resize Slider */}
                                        <div style={{ marginTop: 8, padding: 15 }}>
                                            <div style={{ marginBottom: 4 }}>Logo Size</div>
                                            <input
                                                type="range"
                                                min={24}
                                                max={128}
                                                value={config.themes.logoSize ? parseInt(config.themes.logoSize) : 40}
                                                onChange={e => updateTheme("logoSize", `${e.target.value}px`)}
                                                style={{ width: "100%" }}
                                            />
                                            <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
                                                {config.themes.logoSize || "40px"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Font Style Dropdown */}
                                    <div style={{ marginTop: 16, padding: 15 }}>
                                        <div style={{ marginBottom: 4 }}>Menu Font Style</div>
                                        <select
                                            value={config.themes.fontStyle || "normal"}
                                            onChange={e => updateTheme("fontStyle", e.target.value)}
                                            style={{ width: "100%", padding: "6px", borderRadius: 2 }}
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                            <option value="italic">Italic</option>
                                        </select>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div style={{ 
                                        marginTop: 20, 
                                        display: "flex", 
                                        gap: 8, 
                                        padding: "0 15px",
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
                                                cursor: "pointer"
                                            }}
                                            onClick={handleReload}
                                            disabled={isLoading || isSaving}
                                            title="Reload configuration from SharePoint"
                                        >
                                            🔄 Reload
                                        </button>
                                        <button
                                            style={{
                                                backgroundColor: "#f3f2f1",
                                                color: "#323130",
                                                border: "1px solid #d2d0ce",
                                                borderRadius: 2,
                                                padding: "6px 16px",
                                                fontSize: 14,
                                                cursor: "pointer"
                                            }}
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            style={{
                                                backgroundColor: hasUnsavedChanges ? "#0078d4" : "#d2d0ce",
                                                color: hasUnsavedChanges ? "#ffffff" : "#a19f9d",
                                                border: `1px solid ${hasUnsavedChanges ? "#0078d4" : "#d2d0ce"}`,
                                                borderRadius: 2,
                                                padding: "6px 16px",
                                                fontSize: 14,
                                                cursor: hasUnsavedChanges && !isSaving ? "pointer" : "default"
                                            }}
                                            onClick={handleSave}
                                            disabled={!hasUnsavedChanges || isSaving}
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </Callout>
                            )}
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
            {/* Restore Navigation Add/Edit Callout */}
            {navigationManager.isCalloutVisible && (
              <Callout
                id="navigation_callout"
                target={navigationButtonRef.current}
                onDismiss={navigationManager.cancelEdit}
                setInitialFocus
                styles={{
                  root: {
                    maxWidth: 400,
                    padding: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 2000
                  }
                }}
              >
                <NavigationItemForm
                  formData={navigationManager.formData}
                  validationErrors={navigationManager.validationErrors}
                  isSaving={navigationManager.isSaving}
                  isLoading={navigationManager.isLoading}
                  isEditing={!!navigationManager.editingContext}
                  error={navigationManager.error}
                  hasUnsavedChanges={navigationManager.hasUnsavedChanges}
                  onFieldChange={navigationManager.updateFormField}
                  onSave={navigationManager.saveItem}
                  onCancel={navigationManager.cancelEdit}
                  getFormTitle={navigationManager.getFormTitle}
                  isChildForm={navigationManager.isChildForm}
                  canAddChild={navigationManager.canAddChild}
                  onAddChild={() => {
                    if (
                      navigationManager.editingContext &&
                      typeof navigationManager.editingContext.parentIndex === 'number'
                    ) {
                      navigationManager.openAddChildDialog(navigationManager.editingContext.parentIndex);
                    }
                  }}
                />
              </Callout>
            )}
        </div>
    );
};

export default Container;
