import * as React from 'react';
import { Modal } from '@fluentui/react';
import { NavigationItemForm } from './NavigationItemForm';
import { INavigationManagerState, INavigationManagerActions } from '../hooks/useNavigationManager';

export interface INavModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    navigationManager: INavigationManagerState & INavigationManagerActions;
}

export const NavModal: React.FC<INavModalProps> = ({
    isOpen,
    onDismiss,
    navigationManager
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onDismiss}
            isBlocking={false}
            containerClassName="monarch-nav-dialog"
        >
            <div style={{
                backgroundColor: 'white',
                maxHeight: '90vh',
                overflowY: 'auto',
                maxWidth: 500,
                width: '100%'
            }}>
                <NavigationItemForm
                    formData={navigationManager.formData}
                    validationErrors={navigationManager.validationErrors}
                    isSaving={navigationManager.isSaving}
                    isLoading={navigationManager.isLoading}
                    isEditing={!!navigationManager.editingContext}
                    error={navigationManager.error}
                    hasUnsavedChanges={navigationManager.hasUnsavedChanges}
                    onFieldChange={navigationManager.updateFormField}
                    onSave={navigationManager.saveItem}
                    onCancel={navigationManager.cancelEdit}
                    getFormTitle={navigationManager.getFormTitle}
                    isChildForm={navigationManager.isChildForm}
                    canAddChild={navigationManager.canAddChild}
                    onAddChild={() => {
                        if (
                            navigationManager.editingContext &&
                            typeof navigationManager.editingContext.parentIndex === 'number'
                        ) {
                            navigationManager.openAddChildDialog(navigationManager.editingContext.parentIndex);
                        }
                    }}
                />
            </div>
        </Modal>
    );
};
