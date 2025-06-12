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
  isLoading: boolean;
  error: string | undefined;
  hasUnsavedChanges: boolean;
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
    isSaving: false,
    isLoading: false,
    error: undefined,
    hasUnsavedChanges: false
  });

  // Track initial form data to detect changes
  const [initialFormSnapshot, setInitialFormSnapshot] = React.useState<INavigationItemForm>(initialFormData);

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
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(initialFormData);
  }, []);

  // Open dialog for editing existing item
  const openEditDialog = React.useCallback((index: number, item: IMonarchNavItem): void => {
    const formData = {
      name: item.name,
      link: item.link,
      target: item.target || '_self',
      description: item.description || ''
    };
    
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingIndex: index,
      formData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(formData);
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

  // Save item (add or update) - simplified like todo item
  const saveItem = React.useCallback(async (): Promise<void> => {
    setState(prev => {
      // Get current state values
      const currentFormData = prev.formData;
      const currentEditingIndex = prev.editingIndex;
      
      // Validate form
      const errors: string[] = [];
      if (!currentFormData.name.trim()) {
        errors.push('Title is required');
      }
      if (!currentFormData.link.trim()) {
        errors.push('Link is required');
      }
      
      if (errors.length > 0) {
        return { ...prev, validationErrors: errors };
      }

      // Set saving state
      const newState = { ...prev, isSaving: true, validationErrors: [] };

      // Perform the save operation
      setTimeout(() => {
        try {
          const newItem: IMonarchNavItem = {
            name: currentFormData.name.trim(),
            link: currentFormData.link.trim(),
            target: currentFormData.target,
            description: currentFormData.description.trim() || undefined
          };

          let newItems: IMonarchNavItem[];

          if (currentEditingIndex !== undefined) {
            // Update existing item at specific index
            newItems = [...items];
            newItems[currentEditingIndex] = newItem;
            console.log(`Updated item at index ${currentEditingIndex}:`, newItem);
          } else {
            // Add new item
            newItems = [...items, newItem];
            console.log('Added new item:', newItem);
          }

          // Update items array
          onItemsChange(newItems);
          
          // Close dialog
          setState(finalState => ({
            ...finalState,
            isCalloutVisible: false,
            editingIndex: undefined,
            formData: initialFormData,
            validationErrors: [],
            isSaving: false
          }));

        } catch (error) {
          console.error('Error saving navigation item:', error);
          setState(errorState => ({ 
            ...errorState, 
            validationErrors: ['Failed to save navigation item'],
            isSaving: false 
          }));
        }
      }, 0);

      return newState;
    });
  }, [items, onItemsChange]);

  // Cancel edit
  const cancelEdit = React.useCallback((): void => {
    closeDialog();
  }, [closeDialog]);

  // Detect unsaved changes
  const hasUnsavedChanges = React.useMemo(() => {
    // For new items (not editing), consider changes if any field has content
    if (state.editingIndex === undefined) {
      return (
        state.formData.name.trim() !== '' ||
        state.formData.link.trim() !== '' ||
        state.formData.target !== '_self' ||
        state.formData.description.trim() !== ''
      );
    }
    
    // For editing existing items, compare with initial snapshot
    return (
      state.formData.name !== initialFormSnapshot.name ||
      state.formData.link !== initialFormSnapshot.link ||
      state.formData.target !== initialFormSnapshot.target ||
      state.formData.description !== initialFormSnapshot.description
    );
  }, [state.formData, initialFormSnapshot, state.editingIndex]);

  // Update hasUnsavedChanges in state
  React.useEffect(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges }));
  }, [hasUnsavedChanges]);

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
