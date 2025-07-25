import * as React from 'react';
import { Modal, Toggle, ColorPicker, Callout, IconButton } from '@fluentui/react';
import { IMonarchNavConfig } from '../MonarchNavConfigService';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';

export interface IThemeModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    config: IMonarchNavConfig;
    updateTheme: (key: string, value: unknown) => void;
    handleSave: () => void;
    handleCancel: () => void;
    handleReload: () => void;
    hasUnsavedChanges: boolean;
    isSaving: boolean;
    isLoading: boolean;
    error: string | undefined;
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    context?: BaseApplicationCustomizer<unknown>["context"]; // Add context prop for site URL
}

export const ThemeModal: React.FC<IThemeModalProps> = ({
    isOpen,
    onDismiss,
    config,
    updateTheme,
    handleSave,
    handleCancel,
    handleReload,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    error,
    backgroundColor,
    textColor,
    fontSize,
    context
}) => {
    // Color picker callout states
    const [isBackgroundColorCalloutVisible, setIsBackgroundColorCalloutVisible] = React.useState(false);
    const [isTextColorCalloutVisible, setIsTextColorCalloutVisible] = React.useState(false);

    const backgroundColorButtonRef = React.useRef<HTMLButtonElement>(null);
    const textColorButtonRef = React.useRef<HTMLButtonElement>(null);



    // Handle logo deletion
    const handleDeleteLogo = (): void => {
        if (window.confirm('Are you sure you want to delete the logo?')) {
            updateTheme("logoUrl", "");
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onDismiss={onDismiss}
                isBlocking={false}
                containerClassName="monarch-nav-dialog"
            >
                <div style={{
                    padding: 24,
                    maxWidth: 600,
                    backgroundColor: 'white',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>
                        Theme Settings
                    </h2>
                    
                    {/* Loading/Error states */}
                    {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                    {isLoading && <div style={{ color: '#0078d4', marginBottom: 8 }}>Loading...</div>}
                    
                    {/* First Row: Header Background Color | Menu Items Font Color */}
                    <div className="theme-modal-two-column" style={{ marginBottom: 20 }}>
                        <div>
                            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Header Background Color</div>
                            <button
                                ref={backgroundColorButtonRef}
                                onClick={() => setIsBackgroundColorCalloutVisible(!isBackgroundColorCalloutVisible)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: backgroundColor,
                                    border: '2px solid #ccc',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title={`Current color: ${backgroundColor}`}
                            />
                        </div>
                        <div>
                            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>Menu Items Font Color</div>
                            <button
                                ref={textColorButtonRef}
                                onClick={() => setIsTextColorCalloutVisible(!isTextColorCalloutVisible)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: textColor,
                                    border: '2px solid #ccc',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title={`Current color: ${textColor}`}
                            />
                        </div>
                    </div>
                    
                    {/* Second Row: Header Logo | Menu Items Font Size */}
                    <div className="theme-modal-two-column" style={{ marginBottom: 20 }}>
                        <div>
                            <div style={{ marginBottom: 4 }}>Header Logo</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                {config.themes.logoUrl && config.themes.logoUrl.trim() !== "" ? (
                                    <>
                                        <img
                                            src={config.themes.logoUrl}
                                            alt="Logo"
                                            style={{
                                                height: config.themes.logoSize || "40px",
                                                width: "auto",
                                                borderRadius: 4,
                                                background: "#fff",
                                                border: "1px solid #eee"
                                            }}
                                        />
                                        <IconButton
                                            iconProps={{ iconName: "Delete" }}
                                            title="Delete Logo"
                                            ariaLabel="Delete Logo"
                                            onClick={handleDeleteLogo}
                                            styles={{
                                                root: {
                                                    opacity: 0.8,
                                                    background: "rgba(255,245,245,0.9)",
                                                    color: "#e53e3e",
                                                    border: "1px solid rgba(254,215,215,0.8)",
                                                    borderRadius: 4,
                                                    padding: 0,
                                                    height: 32,
                                                    width: 32,
                                                    minWidth: 32,
                                                    minHeight: 32,
                                                    transition: "all 0.15s ease"
                                                },
                                                rootHovered: {
                                                    opacity: 1,
                                                    background: "rgba(254,215,215,0.95)",
                                                    borderColor: "rgba(254,178,178,0.9)",
                                                    transform: "scale(1.05)"
                                                },
                                                icon: {
                                                    fontSize: 14,
                                                    color: "#e53e3e"
                                                }
                                            }}
                                        />
                                    </>
                                ) : (
                                    <div style={{
                                        height: config.themes.logoSize || "40px",
                                        width: "auto",
                                        borderRadius: 4,
                                        background: "#f8f9fa",
                                        border: "1px solid #dee2e6",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#6c757d",
                                        fontSize: "12px",
                                        padding: "0 8px"
                                    }}>
                                        No Logo Set
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ marginBottom: 8, width: "100%" }}
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
                        </div>
                        <div>
                            <div style={{ marginBottom: 4 }}>Menu Items Font Size</div>
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
                    </div>
                    
                    {/* Third Row: Logo Size | Menu Font Style */}
                    <div className="theme-modal-two-column" style={{ marginBottom: 20 }}>
                        <div>
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
                        <div>
                            {/* Menu Font Style and Align Menu Items side by side */}
                            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                <div style={{ flex: 1 }}>
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
                                
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 4 }}>Align Menu Items</div>
                                    <select
                                        value={config.themes.items_alignment || "left"}
                                        onChange={e => updateTheme("items_alignment", e.target.value)}
                                        style={{ width: "100%", padding: "6px", borderRadius: 2 }}
                                    >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fourth Row: Top & Bottom Padding | Left & Right Padding */}
                    <div className="theme-modal-two-column" style={{ marginBottom: 20 }}>
                        <div>
                            <div style={{ marginBottom: 4 }}>Top & Bottom Padding</div>
                            <input
                                type="range"
                                min={8}
                                max={32}
                                step={1}
                                value={config.themes.padding_top_bottom ? parseInt(config.themes.padding_top_bottom) : 0}
                                onChange={e => updateTheme('padding_top_bottom', `${e.target.value}px`)}
                                style={{ width: "100%" }}
                            />
                            <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
                                {config.themes.padding_top_bottom || "0px"}
                            </div>
                        </div>
                        <div>
                            <div style={{ marginBottom: 4 }}>Left & Right Padding</div>
                            <input
                                type="range"
                                min={8}
                                max={32}
                                step={1}
                                value={config.themes.padding_left_right ? parseInt(config.themes.padding_left_right) : 8}
                                onChange={e => updateTheme('padding_left_right', `${e.target.value}px`)}
                                style={{ width: "100%" }}
                            />
                            <div style={{ textAlign: "right", fontSize: 12, marginTop: 2 }}>
                                {config.themes.padding_left_right || "8px"}
                            </div>
                        </div>
                    </div>

                    {/* SharePoint Element Visibility Toggles */}
                    <div style={{ marginTop: 20, marginBottom: 20 }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
                            SharePoint Element Visibility
                        </h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {/* Default Header Toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{config.themes.is_sp_header ? 'Hide' : 'Show'} Default Header</span>
                                <Toggle
                                    checked={config.themes.is_sp_header}
                                    onChange={(_e, checked) => updateTheme('is_sp_header', !!checked)}
                                    styles={{
                                        root: { marginBottom: 0 }
                                    }}
                                />
                            </div>

                            {/* Suite Navigation Toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{config.themes.is_suite_nav ? 'Hide' : 'Show'} Suite Navigation</span>
                                <Toggle
                                    checked={config.themes.is_suite_nav}
                                    onChange={(_e, checked) => updateTheme('is_suite_nav', !!checked)}
                                    styles={{
                                        root: { marginBottom: 0 }
                                    }}
                                />
                            </div>

                            {/* Command Bar Toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{config.themes.is_command_bar ? 'Hide' : 'Show'} Command Bar</span>
                                <Toggle
                                    checked={config.themes.is_command_bar}
                                    onChange={(_e, checked) => updateTheme('is_command_bar', !!checked)}
                                    styles={{
                                        root: { marginBottom: 0 }
                                    }}
                                />
                            </div>

                            {/* App Bar Toggle */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontSize: 14 }}>{config.themes.is_app_bar ? 'Hide' : 'Show'} App Bar</span>
                                <Toggle
                                    checked={config.themes.is_app_bar}
                                    onChange={(_e, checked) => updateTheme('is_app_bar', !!checked)}
                                    styles={{
                                        root: { marginBottom: 0 }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ 
                        marginTop: 20, 
                        display: "flex", 
                        gap: 12, 
                        padding: "0",
                        justifyContent: "flex-end",
                        alignItems: "center"
                    }}>
                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8 }}>
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
                    </div>
                </div>
            </Modal>
            
            {/* Background Color Picker Callout */}
            {isBackgroundColorCalloutVisible && (
                <Callout
                    target={backgroundColorButtonRef.current}
                    onDismiss={() => setIsBackgroundColorCalloutVisible(false)}
                    styles={{
                        root: {
                            padding: 16,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Header Background Color</div>
                    <ColorPicker
                        color={backgroundColor}
                        onChange={(_ev, colorObj: { str: string }) => 
                            updateTheme('backgroundColor', colorObj.str)
                        }
                        alphaType="none"
                        showPreview={true}
                    />
                </Callout>
            )}
            
            {/* Text Color Picker Callout */}
            {isTextColorCalloutVisible && (
                <Callout
                    target={textColorButtonRef.current}
                    onDismiss={() => setIsTextColorCalloutVisible(false)}
                    styles={{
                        root: {
                            padding: 16,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        },
                    }}
                >
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Menu Items Font Color</div>
                    <ColorPicker
                        color={textColor}
                        onChange={(_ev, colorObj: { str: string }) => 
                            updateTheme('textColor', colorObj.str)
                        }
                        alphaType="none"
                        showPreview={true}
                    />
                </Callout>
            )}
        </>
    );
};
