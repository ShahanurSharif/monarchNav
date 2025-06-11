import * as React from 'react';
import { 
  TextField, 
  Dropdown, 
  IDropdownOption, 
  DefaultButton, 
  PrimaryButton,
  Stack,
  Text
} from '@fluentui/react';
import { INavigationItemForm } from '../hooks/useNavigationManager';

export interface INavigationItemFormProps {
  formData: INavigationItemForm;
  validationErrors: string[];
  isSaving: boolean;
  isEditing: boolean;
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
  isEditing,
  onFieldChange,
  onSave,
  onCancel
}) => {
  
  // Target options for dropdown
  const targetOptions: IDropdownOption[] = [
    { key: '_self', text: 'Same tab (default)' },
    { key: '_blank', text: 'New tab' }
  ];

  // Handle save with validation
  const handleSave = async (): Promise<void> => {
    try {
      await onSave();
    } catch (error) {
      console.error('Error saving navigation item:', error);
    }
  };

  return (
    <div style={{ padding: 16, minWidth: 300 }}>
      <Stack tokens={{ childrenGap: 16 }}>
        {/* Form Title */}
        <Text variant="large" style={{ fontWeight: 600, marginBottom: 8 }}>
          {isEditing ? 'Edit Navigation Item' : 'Add Navigation Item'}
        </Text>

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

        {/* Action Buttons */}
        <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 16 }}>
          <DefaultButton
            text="Cancel"
            onClick={onCancel}
            disabled={isSaving}
            styles={{
              root: {
                backgroundColor: '#f3f2f1',
                color: '#323130',
                border: '1px solid #d2d0ce'
              }
            }}
          />
          <PrimaryButton
            text={isSaving ? 'Saving...' : 'Save'}
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim() || !formData.link.trim()}
            styles={{
              root: {
                backgroundColor: '#0078d4',
                color: 'white'
              },
              rootHovered: {
                backgroundColor: '#106ebe'
              }
            }}
          />
        </Stack>
      </Stack>
    </div>
  );
};
