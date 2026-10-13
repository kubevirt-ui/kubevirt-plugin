import { FLEET_WIZARD_PATH } from '../constants';

import { isVMWizardURL } from './vmUrls';

describe('isVMWizardURL', () => {
  it('should match spoke wizard paths with a path boundary', () => {
    expect(isVMWizardURL('/vm-wizard')).toBe(true);
    expect(isVMWizardURL('/vm-wizard/ns/default')).toBe(true);
    expect(isVMWizardURL('/vm-wizard?perspective=admin')).toBe(true);
    expect(isVMWizardURL('/vm-wizard#step')).toBe(true);
  });

  it('should not match unrelated paths that share the spoke wizard prefix', () => {
    expect(isVMWizardURL('/vm-wizardx')).toBe(false);
    expect(isVMWizardURL('/vm-wizard-backup')).toBe(false);
  });

  it('should match fleet wizard paths with a path boundary', () => {
    expect(isVMWizardURL(FLEET_WIZARD_PATH)).toBe(true);
    expect(isVMWizardURL(`${FLEET_WIZARD_PATH}/ns/default`)).toBe(true);
    expect(isVMWizardURL(`${FLEET_WIZARD_PATH}?cluster=local`)).toBe(true);
  });

  it('should not match unrelated paths that share the fleet wizard prefix', () => {
    expect(isVMWizardURL(`${FLEET_WIZARD_PATH}x`)).toBe(false);
  });
});
