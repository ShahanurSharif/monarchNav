import * as React from 'react';
import { 
  TextField, 
  Dropdown, 
  IDropdownOption, 
  Stack,
  Text
} from '@fluentui/react';
import { INavigationItemForm } from '../hooks/useNavigationManager';

export interface INavigationItemFormProps {
  formData: INavigationItemForm;
  validationErrors: string[];
  isSaving: boolean;
  isLoading?: boolean;
  isEditing: boolean;
  error?: string;
  hasUnsavedChanges?: boolean;
  onFieldChange: (field: keyof INavigationItemForm, value: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Form component for adding/editing navigation items
 * Provides validation and user-friendly interface
 */
export const NavigationItemForm: React.FC<INavigationItemFormProps> = ({
  formData,
  validationErrors,
  isSaving,
  isLoading = false,
  isEditing,
  error,
  hasUnsavedChanges = false,
  onFieldChange,
  onSave,
  onCancel
}) => {
  
  // Target options for dropdown
  const targetOptions: IDropdownOption[] = [
    { key: '_self', text: 'Same tab (default)' },
    { key: '_blank', text: 'New tab' }
  ];

  // Simple validation - just check required fields
  const isFormValid = formData.name.trim() && formData.link.trim();

  // Handle save - simplified like todo item save
  const handleSave = async (): Promise<void> => {
    if (!isFormValid) return;
    
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving navigation item:', error);
      alert("Error saving navigation item. Please try again.");
    }
  };

  // Handle cancel - simplified
  const handleCancel = (): void => {
    // Only ask for confirmation if there's actual content in the form
    const hasContent = formData.name.trim() || formData.link.trim() || formData.description.trim();
    
    if (hasContent) {
      const confirmed = confirm("Are you sure you want to cancel? Your changes will be lost.");
      if (!confirmed) return;
    }
    onCancel();
  };

  return (
    <div style={{ padding: 16, minWidth: 300 }}>
      <Stack tokens={{ childrenGap: 16 }}>
        {/* Form Title */}
        <Text variant="large" style={{ fontWeight: 600, marginBottom: 8 }}>
          {isEditing ? 'Edit Navigation Item' : 'Add Navigation Item'}
        </Text>

        {/* Loading/Error states */}
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {isLoading && <div style={{ color: '#0078d4', marginBottom: 8 }}>Loading...</div>}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div style={{ 
            padding: 8, 
            backgroundColor: '#fed9cc', 
            border: '1px solid #d13438',
            borderRadius: 4 
          }}>
            {validationErrors.map((error, index) => (
              <Text key={index} style={{ color: '#d13438', fontSize: 12 }}>
                • {error}
              </Text>
            ))}
          </div>
        )}

        {/* Title Field */}
        <TextField
          label="Title"
          placeholder="Enter navigation title"
          value={formData.name}
          onChange={(_, newValue) => onFieldChange('name', newValue || '')}
          required
          maxLength={50}
          description="Display name for the navigation item"
        />

        {/* Link Field */}
        <TextField
          label="Link"
          placeholder="https://example.com or /sites/mysite"
          value={formData.link}
          onChange={(_, newValue) => onFieldChange('link', newValue || '')}
          required
          description="URL or relative path to navigate to"
        />

        {/* Target Dropdown */}
        <div>
          <Dropdown
            label="Open in"
            options={targetOptions}
            selectedKey={formData.target}
            onChange={(_, option) => onFieldChange('target', option?.key as string || '_self')}
          />
          <Text variant="small" style={{ color: '#605e5c', marginTop: 4 }}>
            Choose how the link should open
          </Text>
        </div>

        {/* Description Field */}
        <TextField
          label="Description"
          placeholder="Optional description for accessibility"
          value={formData.description}
          onChange={(_, newValue) => onFieldChange('description', newValue || '')}
          maxLength={100}
          description="Optional tooltip text (recommended for accessibility)"
        />

        {/* Action buttons - simplified like todo item actions */}
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
              cursor: isSaving ? "default" : "pointer",
              fontWeight: 400
            }}
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            style={{
              backgroundColor: isFormValid ? "#0078d4" : "#d2d0ce",
              color: isFormValid ? "#ffffff" : "#a19f9d",
              border: `1px solid ${isFormValid ? "#0078d4" : "#d2d0ce"}`,
              borderRadius: 2,
              padding: "6px 16px",
              fontSize: 14,
              cursor: (isFormValid && !isSaving) ? "pointer" : "default",
              fontWeight: 600
            }}
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? "Applying..." : "Apply"}
          </button>
        </div>
      </Stack>
    </div>
  );
};
