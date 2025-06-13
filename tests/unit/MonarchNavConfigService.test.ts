import { MonarchNavConfigService } from '../../src/extensions/monarchNav/MonarchNavConfigService';

describe('MonarchNavConfigService', () => {
  it('should have loadConfig and saveConfig methods', () => {
    expect(typeof MonarchNavConfigService.loadConfig).toBe('function');
    expect(typeof MonarchNavConfigService.saveConfig).toBe('function');
  });
});
