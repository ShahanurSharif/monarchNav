import * as React from 'react';
import { IMonarchNavItem } from '../MonarchNavConfigService';

/**
 * Navigation item form data interface
 */
export interface INavigationItemForm {
  name: string;
  link: string;
  target: '_blank' | '_self';
  description: string;
}

/**
 * Navigation manager state interface
 */
export interface INavigationManagerState {
  isCalloutVisible: boolean;
  editingIndex: number | undefined; // undefined for new item, index for editing
  formData: INavigationItemForm;
  validationErrors: string[];
  isSaving: boolean;
}

/**
 * Navigation manager actions interface
 */
export interface INavigationManagerActions {
  openAddDialog: () => void;
  openEditDialog: (index: number, item: IMonarchNavItem) => void;
  closeDialog: () => void;
  updateFormField: (field: keyof INavigationItemForm, value: string) => void;
  validateForm: () => boolean;
  saveItem: () => Promise<void>;
  cancelEdit: () => void;
}

/**
 * Hook for managing navigation items (add/edit/delete)
 * Handles form state, validation, and CRUD operations
 */
export const useNavigationManager = (
  items: IMonarchNavItem[],
  onItemsChange: (newItems: IMonarchNavItem[]) => void
): INavigationManagerState & INavigationManagerActions => {

  // Initial form state
  const initialFormData: INavigationItemForm = {
    name: '',
    link: '',
    target: '_self',
    description: ''
  };

  // State management
  const [state, setState] = React.useState<INavigationManagerState>({
    isCalloutVisible: false,
    editingIndex: undefined,
    formData: initialFormData,
    validationErrors: [],
    isSaving: false
  });

  // Validation function
  const validateForm = React.useCallback((): boolean => {
    const errors: string[] = [];
    
    if (!state.formData.name.trim()) {
      errors.push('Title is required');
    }
    
    if (!state.formData.link.trim()) {
      errors.push('Link is required');
    } else {
      // Basic URL validation - check for common URL patterns or relative paths
      const link = state.formData.link.trim();
      const isAbsoluteUrl = link.indexOf('http://') === 0 || link.indexOf('https://') === 0 || link.indexOf('mailto:') === 0;
      const isRelativePath = link.indexOf('/') === 0 || link.indexOf('#') === 0 || link.indexOf('./') === 0;
      
      if (!isAbsoluteUrl && !isRelativePath && link.indexOf('.') === -1) {
        errors.push('Please enter a valid URL or relative path');
      }
    }

    setState(prev => ({ ...prev, validationErrors: errors }));
    return errors.length === 0;
  }, [state.formData]);

  // Open dialog for adding new item
  const openAddDialog = React.useCallback((): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingIndex: undefined,
      formData: initialFormData,
      validationErrors: []
    }));
  }, []);

  // Open dialog for editing existing item
  const openEditDialog = React.useCallback((index: number, item: IMonarchNavItem): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingIndex: index,
      formData: {
        name: item.name,
        link: item.link,
        target: item.target || '_self',
        description: item.description || ''
      },
      validationErrors: []
    }));
  }, []);

  // Close dialog
  const closeDialog = React.useCallback((): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: false,
      editingIndex: undefined,
      formData: initialFormData,
      validationErrors: [],
      isSaving: false
    }));
  }, []);

  // Update form field
  const updateFormField = React.useCallback((
    field: keyof INavigationItemForm, 
    value: string
  ): void => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      },
      validationErrors: [] // Clear errors on change
    }));
  }, []);

  // Save item (add or update)
  const saveItem = React.useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const newItem: IMonarchNavItem = {
        name: state.formData.name.trim(),
        link: state.formData.link.trim(),
        target: state.formData.target,
        description: state.formData.description.trim() || undefined
      };

      let newItems: IMonarchNavItem[];

      if (state.editingIndex !== undefined) {
        // Update existing item
        newItems = [...items];
        newItems[state.editingIndex] = newItem;
      } else {
        // Add new item
        newItems = [...items, newItem];
      }

      // Update items array
      onItemsChange(newItems);
      
      // Close dialog
      closeDialog();

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        validationErrors: ['Failed to save navigation item'],
        isSaving: false 
      }));
      throw error;
    }
  }, [state.formData, state.editingIndex, items, onItemsChange, validateForm, closeDialog]);

  // Cancel edit
  const cancelEdit = React.useCallback((): void => {
    closeDialog();
  }, [closeDialog]);

  return {
    // State
    ...state,
    
    // Actions
    openAddDialog,
    openEditDialog,
    closeDialog,
    updateFormField,
    validateForm,
    saveItem,
    cancelEdit
  };
};
