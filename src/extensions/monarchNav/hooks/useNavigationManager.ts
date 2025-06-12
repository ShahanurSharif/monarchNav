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
 * Hierarchical editing context interface
 */
export interface INavigationEditingContext {
  type: 'add-parent' | 'edit-parent' | 'add-child' | 'edit-child';
  parentIndex: number;
  childIndex?: number;
  itemPath: string; // Human-readable path like "Home > Documents"
}

/**
 * Enhanced navigation manager state interface
 */
export interface INavigationManagerState {
  isCalloutVisible: boolean;
  editingContext?: INavigationEditingContext;
  formData: INavigationItemForm;
  validationErrors: string[];
  isSaving: boolean;
  isLoading: boolean;
  error: string | undefined;
  hasUnsavedChanges: boolean;
  
  // Backward compatibility
  editingIndex: number | undefined;
}

/**
 * Enhanced navigation manager actions interface
 */
export interface INavigationManagerActions {
  // Parent operations
  openAddDialog: () => void;
  openEditDialog: (index: number, item: IMonarchNavItem) => void;
  openEditParentDialog: (parentIndex: number) => void;
  
  // Child operations
  openAddChildDialog: (parentIndex: number) => void;
  openEditChildDialog: (parentIndex: number, childIndex: number) => void;
  
  // Common operations
  closeDialog: () => void;
  updateFormField: (field: keyof INavigationItemForm, value: string) => void;
  validateForm: () => boolean;
  saveItem: () => Promise<void>;
  cancelEdit: () => void;
  
  // Utility functions
  getFormTitle: () => string;
  isChildForm: () => boolean;
  canAddChild: () => boolean;
}

/**
 * Enhanced Hook for managing hierarchical navigation items
 * Handles form state, validation, and CRUD operations for parent/child items
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

  // Enhanced state management
  const [state, setState] = React.useState<INavigationManagerState>({
    isCalloutVisible: false,
    editingContext: undefined,
    editingIndex: undefined, // Backward compatibility
    formData: initialFormData,
    validationErrors: [],
    isSaving: false,
    isLoading: false,
    error: undefined,
    hasUnsavedChanges: false
  });

  // Track initial form data to detect changes
  const [initialFormSnapshot, setInitialFormSnapshot] = React.useState<INavigationItemForm>(initialFormData);

  // Utility functions
  const getItemPath = React.useCallback((parentIndex: number, childIndex?: number): string => {
    const parent = items[parentIndex];
    if (!parent) return 'Unknown Item';
    
    if (childIndex !== undefined) {
      const child = parent.children?.[childIndex];
      return `${parent.name} > ${child?.name || 'New Child Item'}`;
    }
    
    return parent.name;
  }, [items]);

  // Validation function
  const validateForm = React.useCallback((): boolean => {
    const errors: string[] = [];
    
    if (!state.formData.name.trim()) {
      errors.push('Name is required');
    }
    
    // Link validation - more flexible for child items
    const isChildContext = state.editingContext?.type === 'add-child' || state.editingContext?.type === 'edit-child';
    if (!isChildContext && !state.formData.link.trim()) {
      errors.push('Link is required for parent items');
    } else if (state.formData.link.trim()) {
      // Basic URL validation when link is provided
      const link = state.formData.link.trim();
      const isAbsoluteUrl = link.indexOf('http://') === 0 || link.indexOf('https://') === 0 || link.indexOf('mailto:') === 0;
      const isRelativePath = link.indexOf('/') === 0 || link.indexOf('#') === 0 || link.indexOf('./') === 0;
      
      if (!isAbsoluteUrl && !isRelativePath && link.indexOf('.') === -1) {
        errors.push('Please enter a valid URL or relative path');
      }
    }

    setState(prev => ({ ...prev, validationErrors: errors }));
    return errors.length === 0;
  }, [state.formData, state.editingContext]);

  // Dialog operations
  const openAddDialog = React.useCallback((): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingContext: {
        type: 'add-parent',
        parentIndex: -1, // Will be set when adding
        itemPath: 'New Navigation Item'
      },
      editingIndex: undefined,
      formData: initialFormData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(initialFormData);
  }, [initialFormData]);

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
      editingContext: {
        type: 'edit-parent',
        parentIndex: index,
        itemPath: getItemPath(index)
      },
      editingIndex: index, // Backward compatibility
      formData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(formData);
  }, [getItemPath]);

  const openEditParentDialog = React.useCallback((parentIndex: number): void => {
    const item = items[parentIndex];
    if (!item) return;

    const formData = {
      name: item.name,
      link: item.link,
      target: item.target || '_self',
      description: item.description || ''
    };
    
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingContext: {
        type: 'edit-parent',
        parentIndex,
        itemPath: getItemPath(parentIndex)
      },
      editingIndex: parentIndex,
      formData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(formData);
  }, [items, getItemPath]);

  const openAddChildDialog = React.useCallback((parentIndex: number): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingContext: {
        type: 'add-child',
        parentIndex,
        itemPath: `${items[parentIndex]?.name} > New Child Item`
      },
      editingIndex: undefined,
      formData: initialFormData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(initialFormData);
  }, [items, initialFormData]);

  const openEditChildDialog = React.useCallback((parentIndex: number, childIndex: number): void => {
    const parentItem = items[parentIndex];
    const childItem = parentItem?.children?.[childIndex];
    if (!childItem) return;

    const formData = {
      name: childItem.name,
      link: childItem.link || '',
      target: childItem.target || '_self',
      description: childItem.description || ''
    };
    
    setState(prev => ({
      ...prev,
      isCalloutVisible: true,
      editingContext: {
        type: 'edit-child',
        parentIndex,
        childIndex,
        itemPath: getItemPath(parentIndex, childIndex)
      },
      editingIndex: undefined, // Child editing doesn't use flat index
      formData,
      validationErrors: [],
      hasUnsavedChanges: false
    }));
    setInitialFormSnapshot(formData);
  }, [items, getItemPath]);

  const closeDialog = React.useCallback((): void => {
    setState(prev => ({
      ...prev,
      isCalloutVisible: false,
      editingContext: undefined,
      editingIndex: undefined,
      formData: initialFormData,
      validationErrors: [],
      isSaving: false
    }));
  }, [initialFormData]);

  // Form field updates
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

  // Enhanced save operation
  const saveItem = React.useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    const { editingContext } = state;
    if (!editingContext) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const newItem: IMonarchNavItem = {
        name: state.formData.name.trim(),
        link: state.formData.link.trim(),
        target: state.formData.target,
        description: state.formData.description.trim() || undefined
      };

      // Clone items for immutable update
      const newItems = [...items];

      switch (editingContext.type) {
        case 'add-parent':
          // Add new parent item
          newItems.push(newItem);
          console.log('Added new parent item:', newItem);
          break;

        case 'edit-parent':
          // Update parent, preserve children
          newItems[editingContext.parentIndex] = {
            ...newItem,
            children: newItems[editingContext.parentIndex]?.children
          };
          console.log(`Updated parent item at index ${editingContext.parentIndex}:`, newItem);
          break;

        case 'add-child':
          // Add child to parent
          if (!newItems[editingContext.parentIndex].children) {
            newItems[editingContext.parentIndex].children = [];
          }
          newItems[editingContext.parentIndex].children!.push(newItem);
          console.log(`Added child to parent ${editingContext.parentIndex}:`, newItem);
          break;

        case 'edit-child':
          // Update specific child
          if (editingContext.childIndex !== undefined && newItems[editingContext.parentIndex]?.children) {
            newItems[editingContext.parentIndex].children![editingContext.childIndex] = newItem;
            console.log(`Updated child ${editingContext.parentIndex}-${editingContext.childIndex}:`, newItem);
          }
          break;
      }

      // Update items and close dialog
      console.log('Navigation Manager - Final items before onItemsChange:', JSON.stringify(newItems, null, 2));
      onItemsChange(newItems);
      closeDialog();

    } catch (error) {
      console.error('Error saving navigation item:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to save navigation item',
        validationErrors: ['Failed to save navigation item'],
        isSaving: false 
      }));
    }
  }, [state.formData, state.editingContext, items, onItemsChange, validateForm, closeDialog]);

  const cancelEdit = React.useCallback((): void => {
    closeDialog();
  }, [closeDialog]);

  // Utility functions
  const getFormTitle = React.useCallback((): string => {
    const { editingContext } = state;
    if (!editingContext) return 'Navigation Item';
    
    switch (editingContext.type) {
      case 'add-parent': return 'Add Navigation Item';
      case 'edit-parent': return 'Edit Navigation Item';
      case 'add-child': return 'Add Child Item';
      case 'edit-child': return 'Edit Child Item';
      default: return 'Navigation Item';
    }
  }, [state.editingContext]);

  const isChildForm = React.useCallback((): boolean => {
    const contextType = state.editingContext?.type;
    return contextType === 'add-child' || contextType === 'edit-child';
  }, [state.editingContext]);

  const canAddChild = React.useCallback((): boolean => {
    return state.editingContext?.type === 'edit-parent';
  }, [state.editingContext]);

  // Detect unsaved changes
  const hasUnsavedChanges = React.useMemo(() => {
    const { editingContext } = state;
    if (!editingContext) return false;

    // For new items, consider changes if any field has content
    const isAddingNewItem = editingContext.type === 'add-parent' || editingContext.type === 'add-child';
    if (isAddingNewItem) {
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
  }, [state.formData, initialFormSnapshot, state.editingContext]);

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
    openEditParentDialog,
    openAddChildDialog,
    openEditChildDialog,
    closeDialog,
    updateFormField,
    validateForm,
    saveItem,
    cancelEdit,
    
    // Utility functions
    getFormTitle,
    isChildForm,
    canAddChild
  };
};
