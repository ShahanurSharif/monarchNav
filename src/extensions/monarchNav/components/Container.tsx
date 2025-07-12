import * as React from "react";
import { IContainerProps } from "./IContainerProps";
import { IconButton, DefaultButton, IButton } from "@fluentui/react";
import { useConfigManager } from "../hooks/useConfigManager";
import { useNavigationManager } from "../hooks/useNavigationManager";
import { MonarchNavConfigService } from "../MonarchNavConfigService";
import { ThemeModal } from "./ThemeModal";
import { NavModal } from "./NavModal";

const Container: React.FC<IContainerProps> = (props) => {
    // Mobile responsive state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    // Check screen size and update mobile state
    React.useEffect(() => {
        const checkMobile = (): void => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Inject CSS for dialog styling and responsive design
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

            /* Mobile Navigation Styles */
            @media (max-width: 768px) {
                .monarch-nav-mobile-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1002;
                    animation: fadeIn 0.3s ease;
                }
                
                .monarch-nav-mobile-menu {
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    width: 280px;
                    background: var(--nav-bg-color);
                    box-shadow: -2px 0 8px rgba(0,0,0,0.2);
                    z-index: 1003;
                    overflow-y: auto;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                
                .monarch-nav-mobile-menu.open {
                    transform: translateX(0);
                }
                
                .monarch-nav-mobile-item {
                    display: block;
                    width: 100%;
                    padding: 18px 24px;
                    border: none;
                    background: none;
                    color: var(--nav-text-color);
                    text-align: left;
                    font-size: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .monarch-nav-mobile-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .monarch-nav-mobile-child {
                    padding: 14px 24px 14px 48px;
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            }

            /* Professional Dropdown Animation */
            @keyframes dropdownFadeIn {
                from { 
                    opacity: 0; 
                    transform: translateY(-8px); 
                    filter: blur(2px);
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                    filter: blur(0);
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

    const settingsButtonRef = React.useRef<IButton>(null);
    const navigationButtonRef = React.useRef<IButton>(null);

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

    // Helper function to apply Suite Navigation visibility
    const applySuiteNavVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('SuiteNavWrapper');
        if (element) {
            element.style.display = visible ? "" : "none";
            console.log(`Applied Suite Navigation visibility (${visible}) to SuiteNavWrapper`);
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('SuiteNavWrapper');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                    console.log(`Applied Suite Navigation visibility (${visible}) to SuiteNavWrapper (delayed)`);
                } else {
                    console.warn('SuiteNavWrapper element not found');
                }
            }, 500);
        }
    }, []);

    // Helper function to apply Command Bar visibility
    const applyCommandBarVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('spCommandBar');
        if (element) {
            element.style.display = visible ? "" : "none";
            console.log(`Applied Command Bar visibility (${visible}) to spCommandBar`);
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('spCommandBar');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                    console.log(`Applied Command Bar visibility (${visible}) to spCommandBar (delayed)`);
                } else {
                    console.warn('spCommandBar element not found');
                }
            }, 500);
        }
    }, []);

    // Helper function to apply App Bar visibility
    const applyAppBarVisibility = React.useCallback((visible: boolean): void => {
        const element = document.getElementById('sp-appBar');
        if (element) {
            element.style.display = visible ? "" : "none";
            console.log(`Applied App Bar visibility (${visible}) to sp-appBar`);
        } else {
            setTimeout(() => {
                const delayedElement = document.getElementById('sp-appBar');
                if (delayedElement) {
                    delayedElement.style.display = visible ? "" : "none";
                    console.log(`Applied App Bar visibility (${visible}) to sp-appBar (delayed)`);
                } else {
                    console.warn('sp-appBar element not found');
                }
            }, 500);
        }
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

    // Apply Suite Navigation visibility when config changes
    React.useEffect(() => {
        applySuiteNavVisibility(config.themes.is_suite_nav);
    }, [config.themes.is_suite_nav, applySuiteNavVisibility]);

    // Apply Command Bar visibility when config changes
    React.useEffect(() => {
        applyCommandBarVisibility(config.themes.is_command_bar);
    }, [config.themes.is_command_bar, applyCommandBarVisibility]);

    // Apply App Bar visibility when config changes
    React.useEffect(() => {
        applyAppBarVisibility(config.themes.is_app_bar);
    }, [config.themes.is_app_bar, applyAppBarVisibility]);

    // Mount effect
    React.useEffect(() => {
        fetchItemsFromList();
    }, [fetchItemsFromList]);

    // Extract values from config for easier access
    const backgroundColor = config.themes.backgroundColor;
    const textColor = config.themes.textColor;
    const padding_top_bottom = config.themes.padding_top_bottom;
    const padding_left_right = config.themes.padding_left_right;
    const fontSize = parseInt(config.themes.items_font_size.replace('px', ''));
    const fontStyle = config.themes.fontStyle || "normal";
    const itemsAlignment = config.themes.items_alignment || "left";
    const homeUrl = props.context.pageContext.web.absoluteUrl;

    // Update CSS custom properties for mobile menu
    React.useEffect(() => {
        document.documentElement.style.setProperty('--nav-bg-color', backgroundColor);
        document.documentElement.style.setProperty('--nav-text-color', textColor);
    }, [backgroundColor, textColor]);

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
                        flex: 1
                    }}
                >
                    {/* Only one Settings and Add Navigation button group to the left of the logo */}
                    {isEditActionsVisible && (
                        <>
                            <DefaultButton
                                componentRef={settingsButtonRef}
                                text="Nav Theme"
                                iconProps={{ iconName: "Settings" }}
                                title="Navigation Theme Settings"
                                onClick={() => setIsSettingsCalloutVisible(!isSettingsCalloutVisible)}
                                style={{ marginRight: 8 }}
                            />
                            <DefaultButton
                                componentRef={navigationButtonRef}
                                text="Add Navigation"
                                iconProps={{ iconName: "list" }}
                                title="Add Navigation Item"
                                onClick={navigationManager.openAddDialog}
                                style={{ marginRight: 8 }}
                            />
                        </>
                    )}
                    {/* Logo */}
                    <a
                        href={props.context.pageContext.web.absoluteUrl}
                        style={{
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center"
                        }}
                        title="Go to site home"
                    >
                        <img
                            src={config.themes.logoUrl || `${props.context.pageContext.web.absoluteUrl}/SiteAssets/MonarchNav.png`}
                            alt="Logo"
                            style={{
                                height: config.themes.logoSize || "40px",
                                width: "auto",
                                marginRight: 16,
                                background: "transparent",
                                cursor: "pointer"
                            }}
                        />
                    </a>
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
                                context={props.context}
                            />
                        </>
                    )}
                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <div
                            id="monarchMenuItems"
                            style={{
                                color: textColor,
                                fontSize: fontSize,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: itemsAlignment === "left" ? "flex-start" : itemsAlignment === "center" ? "center" : "flex-end",
                                gap: 16,
                                padding: "4px 8px",
                                flex: 1
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
                                        padding: `8px ${parseInt(padding_left_right || "8px") / 1.33}px`,
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
                                    {item.name}
                                    {isEditActionsVisible && !isSettingsCalloutVisible && (
                                        <>
                                            <IconButton
                                                iconProps={{ iconName: "Edit" }}
                                                title="Edit Parent"
                                                ariaLabel="Edit Parent"
                                                styles={{
                                                    root: {
                                                        opacity: 0.8,
                                                        background: "rgba(248,249,250,0.9)",
                                                        color: "#495057",
                                                        border: "1px solid rgba(222,226,230,0.8)",
                                                        borderRadius: 4,
                                                        marginLeft: 8,
                                                        padding: 0,
                                                        height: 26,
                                                        width: 26,
                                                        minWidth: 26,
                                                        minHeight: 26,
                                                        transition: "all 0.15s ease"
                                                    },
                                                    rootHovered: {
                                                        opacity: 1,
                                                        background: "rgba(233,236,239,0.95)",
                                                        borderColor: "rgba(173,181,189,0.9)",
                                                        transform: "scale(1.05)"
                                                    },
                                                    icon: {
                                                        fontSize: 12,
                                                        color: "#495057"
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
                                                        opacity: 0.8,
                                                        background: "rgba(255,245,245,0.9)",
                                                        color: "#e53e3e",
                                                        border: "1px solid rgba(254,215,215,0.8)",
                                                        borderRadius: 4,
                                                        marginLeft: 4,
                                                        padding: 0,
                                                        height: 26,
                                                        width: 26,
                                                        minWidth: 26,
                                                        minHeight: 26,
                                                        transition: "all 0.15s ease"
                                                    },
                                                    rootHovered: {
                                                        opacity: 1,
                                                        background: "rgba(254,215,215,0.95)",
                                                        borderColor: "rgba(254,178,178,0.9)",
                                                        transform: "scale(1.05)"
                                                    },
                                                    icon: {
                                                        fontSize: 12,
                                                        color: "#e53e3e"
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
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e1e5e9',
                                            borderRadius: 8,
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                                            minWidth: 280,
                                            maxWidth: 400,
                                            zIndex: 1001,
                                            overflow: 'hidden',
                                            marginTop: 8,
                                            padding: 8,
                                            animation: 'dropdownFadeIn 0.2s ease-out',
                                            backdropFilter: 'blur(10px)',
                                            WebkitBackdropFilter: 'blur(10px)',
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
                                                    color: '#323130',
                                                    fontSize: fontSize - 1,
                                                    cursor: 'pointer',
                                                    padding: '12px 16px',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    borderBottom: childIndex < item.children!.length - 1 ? '1px solid #f3f2f1' : 'none',
                                                    borderRadius: 6,
                                                    minHeight: 48,
                                                    position: 'relative',
                                                    marginBottom: childIndex < item.children!.length - 1 ? 2 : 0,
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
                                                    e.currentTarget.style.backgroundColor = '#f3f2f1';
                                                    e.currentTarget.style.transform = 'translateX(2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: fontSize - 1, color: '#323130', fontWeight: 500 }}>
                                                            {childItem.name}
                                                        </div>
                                                        {/* Description below name, professional style */}
                                                        {childItem.description && childItem.description.trim() !== '' && (
                                                            <div style={{
                                                                fontSize: `${fontSize - 3}px`,
                                                                color: '#605e5c',
                                                                marginTop: 4,
                                                                whiteSpace: 'normal',
                                                                lineHeight: 1.4,
                                                                maxWidth: 240,
                                                                opacity: 0.9,
                                                                fontWeight: 'normal'
                                                            }}>
                                                                {childItem.description}
                                                            </div>
                                                                                                            )}
                                                </div>
                                                    {isEditActionsVisible && !isSettingsCalloutVisible && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                                                            <IconButton
                                                                iconProps={{ iconName: "Edit" }}
                                                                title="Edit Child"
                                                                ariaLabel="Edit Child"
                                                                styles={{
                                                                    root: {
                                                                        opacity: 0.8,
                                                                        background: "#f8f9fa",
                                                                        color: "#495057",
                                                                        border: "1px solid #dee2e6",
                                                                        borderRadius: 4,
                                                                        padding: 0,
                                                                        height: 24,
                                                                        width: 24,
                                                                        minWidth: 24,
                                                                        minHeight: 24,
                                                                        transition: "all 0.15s ease"
                                                                    },
                                                                    rootHovered: {
                                                                        opacity: 1,
                                                                        background: "#e9ecef",
                                                                        borderColor: "#adb5bd",
                                                                        transform: "scale(1.05)"
                                                                    },
                                                                    icon: {
                                                                        fontSize: 11,
                                                                        color: "#495057"
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
                                                                        opacity: 0.8,
                                                                        background: "#fff5f5",
                                                                        color: "#e53e3e",
                                                                        border: "1px solid #fed7d7",
                                                                        borderRadius: 4,
                                                                        padding: 0,
                                                                        height: 24,
                                                                        width: 24,
                                                                        minWidth: 24,
                                                                        minHeight: 24,
                                                                        transition: "all 0.15s ease"
                                                                    },
                                                                    rootHovered: {
                                                                        opacity: 1,
                                                                        background: "#fed7d7",
                                                                        borderColor: "#feb2b2",
                                                                        transform: "scale(1.05)"
                                                                    },
                                                                    icon: {
                                                                        fontSize: 11,
                                                                        color: "#e53e3e"
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm(`Are you sure you want to delete "${childItem.name}"?`)) {
                                                                        navigationManager.deleteChildItem(parentIndex, childIndex);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                                                  )}
                                  </div>
                          ))}
                          
                          {/* Edit Navigation Button - moved inside monarchMenuItems */}
                          {isEditActionsVisible ? (
                              <DefaultButton
                                  text="Close"
                                  iconProps={{ iconName: "Cancel" }}
                                  title="Exit Edit Mode"
                                  onClick={() => {
                                      setIsEditActionsVisible(!isEditActionsVisible);
                                      setIsSettingsCalloutVisible(false);
                                  }}
                                  styles={{
                                      root: {
                                          opacity: 0.8,
                                          background: "rgba(220,53,69,0.15)",
                                          color: "#dc3545",
                                          border: "1px solid rgba(220,53,69,0.3)",
                                          borderRadius: 3,
                                          height: 32,
                                          minWidth: 60,
                                          transition: "all 0.2s ease"
                                      },
                                      rootHovered: {
                                          opacity: 1,
                                          background: "rgba(220,53,69,0.2)",
                                          borderColor: "rgba(220,53,69,0.4)",
                                          transform: "scale(1.05)"
                                      },
                                      label: {
                                          fontSize: 12,
                                          color: "#dc3545"
                                      },
                                      icon: {
                                          fontSize: 12,
                                          color: "#dc3545"
                                      }
                                  }}
                              />
                          ) : (
                              <IconButton
                                  iconProps={{ iconName: "Edit" }}
                                  title="Edit Navigation"
                                  ariaLabel="Edit Navigation"
                                  styles={{
                                      root: {
                                          opacity: 0.8,
                                          background: "rgba(255,255,255,0.15)",
                                          color: textColor,
                                          border: "1px solid rgba(255,255,255,0.3)",
                                          borderRadius: 3,
                                          padding: 0,
                                          height: 32,
                                          width: 32,
                                          minWidth: 32,
                                          minHeight: 32,
                                          transition: "all 0.2s ease"
                                      },
                                      rootHovered: {
                                          opacity: 1,
                                          background: "rgba(255,255,255,0.2)",
                                          borderColor: "rgba(255,255,255,0.4)",
                                          transform: "scale(1.05)"
                                      },
                                      icon: {
                                          fontSize: 14,
                                          color: textColor
                                      }
                                  }}
                                  onClick={() => {
                                      setIsEditActionsVisible(!isEditActionsVisible);
                                      setIsSettingsCalloutVisible(false);
                                  }}
                              />
                          )}
                          </div>
                    )}

                    {/* Mobile Hamburger Menu Button */}
                    {isMobile && (
                        <IconButton
                            iconProps={{ iconName: "GlobalNavButton" }}
                            title="Menu"
                            ariaLabel="Menu"
                            styles={{
                                root: {
                                    color: textColor,
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    borderRadius: 3,
                                    height: 36,
                                    width: 36,
                                    minWidth: 36,
                                }
                            }}
                            onClick={() => setIsMobileMenuOpen(true)}
                        />
                    )}
                </div>
                {/* right side empty for now */}
                <div />
            </div>
            {/* Mobile Menu Overlay */}
            {isMobile && isMobileMenuOpen && (
                <>
                    <div 
                        className="monarch-nav-mobile-overlay"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className={`monarch-nav-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                        <div style={{ 
                            padding: '20px', 
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: textColor, fontSize: 18, fontWeight: 'bold' }}>Navigation</span>
                            <IconButton
                                iconProps={{ iconName: "Cancel" }}
                                title="Close Menu"
                                ariaLabel="Close Menu"
                                styles={{
                                    root: {
                                        color: textColor,
                                        background: "rgba(255,255,255,0.1)",
                                        border: "none",
                                        borderRadius: 50,
                                        height: 32,
                                        width: 32,
                                        minWidth: 32,
                                    }
                                }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        </div>
                        
                        {processedItems.map((item, parentIndex) => (
                            <div key={`mobile-nav-${parentIndex}`}>
                                <button
                                    className="monarch-nav-mobile-item"
                                    onClick={() => {
                                        if (isEditActionsVisible) {
                                            navigationManager.openEditDialog(parentIndex, config.items[parentIndex]);
                                        } else if (item.children && item.children.length > 0) {
                                            // Toggle child items visibility
                                            setDropdownStates(prev => ({ 
                                                ...prev, 
                                                [parentIndex]: !prev[parentIndex] 
                                            }));
                                        } else if (item.link) {
                                            if (item.target === '_blank') {
                                                window.open(item.link, '_blank');
                                            } else {
                                                window.location.href = item.link;
                                            }
                                            setIsMobileMenuOpen(false);
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <span>{item.name}</span>
                                        {item.children && item.children.length > 0 && (
                                            <span style={{ fontSize: 12 }}>
                                                {dropdownStates[parentIndex] ? '▼' : '▶'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                
                                {/* Child items for mobile */}
                                {item.children && item.children.length > 0 && dropdownStates[parentIndex] && 
                                    item.children.map((childItem, childIndex) => (
                                        <button
                                            key={`mobile-child-${parentIndex}-${childIndex}`}
                                            className="monarch-nav-mobile-item monarch-nav-mobile-child"
                                            onClick={() => {
                                                if (isEditActionsVisible) {
                                                    navigationManager.openEditChildDialog(parentIndex, childIndex);
                                                } else if (childItem.link) {
                                                    if (childItem.target === '_blank') {
                                                        window.open(childItem.link, '_blank');
                                                    } else {
                                                        window.location.href = childItem.link;
                                                    }
                                                    setIsMobileMenuOpen(false);
                                                }
                                            }}
                                        >
                                            <div>
                                                <div>{childItem.name}</div>
                                                {childItem.description && (
                                                    <div style={{ 
                                                        fontSize: 12, 
                                                        opacity: 0.7, 
                                                        marginTop: 4 
                                                    }}>
                                                        {childItem.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        ))}
                        
                        {/* Mobile edit actions */}
                        {isEditActionsVisible && (
                            <div style={{ 
                                padding: '20px', 
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                marginTop: 'auto'
                            }}>
                                <DefaultButton
                                    text="Theme Settings"
                                    iconProps={{ iconName: "Settings" }}
                                    onClick={() => {
                                        setIsSettingsCalloutVisible(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    styles={{
                                        root: {
                                            width: '100%',
                                            marginBottom: 8,
                                            background: "rgba(255,255,255,0.1)",
                                            color: textColor,
                                        }
                                    }}
                                />
                                <DefaultButton
                                    text="Add Navigation"
                                    iconProps={{ iconName: "Add" }}
                                    onClick={() => {
                                        navigationManager.openAddDialog();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    styles={{
                                        root: {
                                            width: '100%',
                                            background: "rgba(255,255,255,0.1)",
                                            color: textColor,
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

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
