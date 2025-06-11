import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, Callout, Toggle, ColorPicker } from "@fluentui/react";
import { useConfigManager } from "../hooks/useConfigManager";
import { useNavigationManager } from "../hooks/useNavigationManager";
import { NavigationItemForm } from "./NavigationItemForm";

const Container: React.FC<IContainerProps> = (props) => {
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
        updateConfig
    } = useConfigManager(props.context, props.config);

    // Navigation items management
    const navigationManager = useNavigationManager(
        config.items,
        (newItems) => {
            const newConfig = {
                ...config,
                items: newItems
            };
            updateConfig(newConfig);
        }
    );

    // UI state
    const [isSettingsCalloutVisible, setIsSettingsCalloutVisible] = React.useState(false);
    const [isEditActionsVisible, setIsEditActionsVisible] = React.useState(false);

    const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
    const navigationButtonRef = React.useRef<HTMLButtonElement>(null);

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
            alert("Settings saved successfully!");
        } catch {
            alert("Error saving settings. Please try again.");
        }
    }, [saveConfig]);

    // Handle cancel button click
    const handleCancel = React.useCallback((): void => {
        resetConfig();
        setIsSettingsCalloutVisible(false);
    }, [resetConfig]);

    // Handle reload button click
    const handleReload = React.useCallback(async (): Promise<void> => {
        try {
            await reloadConfig();
        } catch {
            alert("Error reloading configuration. Please try again.");
        }
    }, [reloadConfig]);

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
                                <span role="img" aria-label="Settings">
                                    ⚙️
                                </span>
                            </button>
                            {isSettingsCalloutVisible && (
                                <Callout
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
                                    
                                    {/* Reload button */}
                                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                                        <button
                                            style={{
                                                backgroundColor: "#f3f2f1",
                                                color: "#323130",
                                                border: "1px solid #d2d0ce",
                                                borderRadius: 2,
                                                padding: "4px 12px",
                                                fontSize: 12,
                                                cursor: "pointer",
                                                fontWeight: 400
                                            }}
                                            onClick={handleReload}
                                            disabled={isLoading || isSaving}
                                            title="Reload configuration from SharePoint"
                                        >
                                            🔄 Reload
                                        </button>
                                    </div>
                                    
                                    {/* SharePoint Header Toggle */}
                                    <Toggle
                                        label="Show SharePoint Header"
                                        checked={config.themes.is_sp_header}
                                        onChange={(_e, checked) => updateTheme('is_sp_header', !!checked)}
                                    />
                                    
                                    {/* Background color picker */}
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
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
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
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
                                    <div style={{ marginTop: 16 }}>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
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
                                                cursor: hasUnsavedChanges && !isSaving ? "pointer" : "default",
                                                fontWeight: 600
                                            }}
                                            onClick={handleSave}
                                            disabled={!hasUnsavedChanges || isSaving}
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </Callout>
                            )}
                            <button
                                ref={navigationButtonRef}
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
                                onClick={navigationManager.openAddDialog}
                            >
                                Add/Edit Navigation
                            </button>

                            {/* Navigation Item Form Callout */}
                            {navigationManager.isCalloutVisible && (
                                <Callout
                                    id="navigation_callout"
                                    target={navigationButtonRef.current}
                                    onDismiss={navigationManager.closeDialog}
                                    setInitialFocus
                                    styles={{
                                        root: {
                                            maxWidth: 400,
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                                        },
                                    }}
                                >
                                    <NavigationItemForm
                                        formData={navigationManager.formData}
                                        validationErrors={navigationManager.validationErrors}
                                        isSaving={navigationManager.isSaving}
                                        isEditing={navigationManager.editingIndex !== undefined}
                                        onFieldChange={navigationManager.updateFormField}
                                        onSave={navigationManager.saveItem}
                                        onCancel={navigationManager.cancelEdit}
                                    />
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
                        }}
                    >
                        {/* Dynamic navigation items from config */}
                        {processedItems.map((item, index) => (
                            <button
                                key={index}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: textColor,
                                    fontSize: fontSize,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: "8px 16px",
                                    borderRadius: 4,
                                    transition: "background-color 0.2s ease",
                                }}
                                title={item.description || item.name}
                                aria-label={item.name}
                                onClick={(e) => {
                                    if (isEditActionsVisible) {
                                        // In edit mode, clicking opens edit dialog
                                        e.preventDefault();
                                        navigationManager.openEditDialog(index, config.items[index]);
                                    } else {
                                        // Normal mode, navigate to link
                                        if (item.target === '_blank') {
                                            window.open(item.link, '_blank');
                                        } else {
                                            window.location.href = item.link;
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
                                {item.name}
                                {isEditActionsVisible && (
                                    <span style={{ fontSize: 12, marginLeft: 4, opacity: 0.7 }}>
                                        ✏️
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <IconButton
                        iconProps={{ iconName: "Edit" }}
                        title="Edit"
                        ariaLabel="Edit"
                        styles={{
                            root: { color: "white", background: "none" },
                        }}
                        onClick={() => {
                            setIsEditActionsVisible(!isEditActionsVisible);
                            setIsSettingsCalloutVisible(false);
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
        </div>
    );
};

export default Container;
