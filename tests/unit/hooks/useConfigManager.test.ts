import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as React from 'react';
import { useConfigManager } from '../../../src/extensions/monarchNav/hooks/useConfigManager';

describe('useConfigManager', () => {
  it('returns config and state', () => {
    // Mock context and config
    const context = {} as any;
    const config = { items: [], themes: {} } as any;
    let result: any = {};
    function TestComponent() {
      result = useConfigManager(context, config);
      return null;
    }
    render(React.createElement(TestComponent));
    expect(result.config).toBeDefined();
    expect(result.isLoading).toBeDefined();
    expect(result.isSaving).toBeDefined();
  });
});
