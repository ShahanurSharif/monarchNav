import * as React from 'react';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { MonarchNavConfigService, IMonarchNavConfig } from '../MonarchNavConfigService';

export interface IConfigManagerState {
    config: IMonarchNavConfig;
    originalConfig: IMonarchNavConfig;
    isSaving: boolean;
    isLoading: boolean;
    error: string | undefined;
    hasUnsavedChanges: boolean;
}

export interface IConfigManagerActions {
    updateConfig: (newConfig: IMonarchNavConfig) => void;
    updateTheme: (property: keyof IMonarchNavConfig['themes'], value: string | boolean) => void;
    saveConfig: () => Promise<void>;
    reloadConfig: () => Promise<void>;
    resetConfig: () => void;
    markAsSaved: () => void;
    clearError: () => void;
}

/**
 * Custom hook for managing MonarchNav configuration state
 * Provides state management, validation, and SharePoint integration
 */
export const useConfigManager = (
    context: ApplicationCustomizerContext,
    initialConfig: IMonarchNavConfig
): IConfigManagerState & IConfigManagerActions => {
    const [config, setConfig] = React.useState<IMonarchNavConfig>(initialConfig);
    const [originalConfig, setOriginalConfig] = React.useState<IMonarchNavConfig>(initialConfig);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);

    // Calculate if there are unsaved changes
    const hasUnsavedChanges = React.useMemo(
        () => JSON.stringify(config) !== JSON.stringify(originalConfig),
        [config, originalConfig]
    );

    // Validate configuration
    const validateConfig = React.useCallback((configToValidate: IMonarchNavConfig): string[] => {
        const errors: string[] = [];
        
        if (!configToValidate.themes.backgroundColor) {
            errors.push('Background color is required');
        }
        
        if (!configToValidate.themes.textColor) {
            errors.push('Text color is required');
        }
        
        const fontSize = parseInt(configToValidate.themes.items_font_size.replace('px', ''));
        if (isNaN(fontSize) || fontSize < 8 || fontSize > 48) {
            errors.push('Font size must be between 8px and 48px');
        }

        // Validate padding_top_bottom
        const padding = configToValidate.themes.padding_top_bottom;
        if (!padding || typeof padding !== 'string' || !/^\d{1,2}px$/.test(padding)) {
            errors.push('Top & Bottom Padding must be a string in the format "0px" to "64px"');
        } else {
            const value = parseInt(padding.replace('px', ''));
            if (isNaN(value) || value < 0 || value > 64) {
                errors.push('Top & Bottom Padding must be between 0px and 64px');
            }
        }
        
        return errors;
    }, []);

    // Actions
    const updateConfig = React.useCallback((newConfig: IMonarchNavConfig) => {
        console.log('Config Manager - Updating config with items:', JSON.stringify(newConfig.items, null, 2));
        setConfig(newConfig);
        setError(undefined);
    }, []);

    const updateTheme = React.useCallback((
        property: keyof IMonarchNavConfig['themes'], 
        value: string | boolean
    ) => {
        setConfig(prev => ({
            ...prev,
            themes: {
                ...prev.themes,
                [property]: value
            }
        }));
        setError(undefined);
    }, []);

    const saveConfig = React.useCallback(async (): Promise<void> => {
        try {
            setIsSaving(true);
            setError(undefined);
            
            // Validate configuration before saving
            const validationErrors = validateConfig(config);
            if (validationErrors.length > 0) {
                setError(`Validation errors: ${validationErrors.join(', ')}`);
                return;
            }
            
            console.log('Config Manager - About to save config with items:', JSON.stringify(config.items, null, 2));
            await MonarchNavConfigService.saveConfig(context, config);
            
            // Update original config to reflect saved state
            setOriginalConfig(config);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
            setError(errorMessage);
            console.error("Error saving configuration:", error);
            throw error; // Re-throw for component to handle
        } finally {
            setIsSaving(false);
        }
    }, [config, context, validateConfig]);

    const reloadConfig = React.useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(undefined);
            
            const freshConfig = await MonarchNavConfigService.loadConfig(context);
            setConfig(freshConfig);
            setOriginalConfig(freshConfig);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reload configuration';
            setError(errorMessage);
            console.error("Error reloading configuration:", error);
            throw error; // Re-throw for component to handle
        } finally {
            setIsLoading(false);
        }
    }, [context]);

    const resetConfig = React.useCallback((): void => {
        setConfig(originalConfig);
        setError(undefined);
    }, [originalConfig]);
    
    const markAsSaved = React.useCallback((): void => {
        setOriginalConfig(config);
    }, [config]);

    const clearError = React.useCallback((): void => {
        setError(undefined);
    }, []);

    // Sync with external config changes
    React.useEffect(() => {
        setConfig(initialConfig);
        setOriginalConfig(initialConfig);
    }, [initialConfig]);

    return {
        // State
        config,
        originalConfig,
        isSaving,
        isLoading,
        error,
        hasUnsavedChanges,
        // Actions
        updateConfig,
        updateTheme,
        saveConfig,
        reloadConfig,
        resetConfig,
        markAsSaved,
        clearError
    };
};
