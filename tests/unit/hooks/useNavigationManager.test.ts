import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as React from 'react';
import { useNavigationManager } from '../../../src/extensions/monarchNav/hooks/useNavigationManager';

describe('useNavigationManager', () => {
  it('returns navigation manager state and actions', () => {
    const items: any[] = [];
    const onItemsChange = jest.fn();
    let result: any = {};
    function TestComponent(): null {
      result = useNavigationManager(items, onItemsChange);
      return null;
    }
    render(React.createElement(TestComponent));
    expect(result.isCalloutVisible).toBeDefined();
    expect(result.openAddDialog).toBeInstanceOf(Function);
  });
});
