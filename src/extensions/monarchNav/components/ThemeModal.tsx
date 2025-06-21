import * as React from 'react';
import { Modal, Toggle, ColorPicker, Callout } from '@fluentui/react';
import { IMonarchNavConfig } from '../MonarchNavConfigService';

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
    fontSize
}) => {
    // Color picker callout states
    const [isBackgroundColorCalloutVisible, setIsBackgroundColorCalloutVisible] = React.useState(false);
    const [isTextColorCalloutVisible, setIsTextColorCalloutVisible] = React.useState(false);

    const backgroundColorButtonRef = React.useRef<HTMLButtonElement>(null);
    const textColorButtonRef = React.useRef<HTMLButtonElement>(null);

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
                    </div>
                    
                    {/* Action buttons with SharePoint Header toggle */}
                    <div style={{ 
                        marginTop: 20, 
                        display: "flex", 
                        gap: 12, 
                        padding: "0",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        {/* Left side: SharePoint Header toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>Show SharePoint Header</span>
                            <Toggle
                                checked={config.themes.is_sp_header}
                                onChange={(_e, checked) => updateTheme('is_sp_header', !!checked)}
                                styles={{
                                    root: { marginBottom: 0 }
                                }}
                            />
                        </div>
                        
                        {/* Right side: Action buttons */}
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
