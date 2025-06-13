import * as React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationItemForm } from '../../../src/extensions/monarchNav/components/NavigationItemForm';

describe('NavigationItemForm', () => {
  it('renders form fields and calls onSave', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();
    const onFieldChange = jest.fn();
    const getFormTitle = (): string => 'Test Title';
    const { getByLabelText, getByText } = render(
      <NavigationItemForm
        formData={{ name: 'Test', link: 'https://example.com', target: '_self', description: '' }}
        validationErrors={[]}
        isSaving={false}
        isLoading={false}
        isEditing={false}
        error={undefined}
        hasUnsavedChanges={true}
        onFieldChange={onFieldChange}
        onSave={onSave}
        onCancel={onCancel}
        getFormTitle={getFormTitle}
        isChildForm={() => false}
        canAddChild={() => false}
      />
    );
    fireEvent.change(getByLabelText(/Title/i), { target: { value: 'Test' } });
    fireEvent.click(getByText(/Apply/i));
    expect(onSave).toHaveBeenCalled();
  });
});
