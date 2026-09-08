import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { migrationPolicySpecKeys } from './constants';
import {
  getMigrationPolicyBandwidthDisplayValue,
  getMigrationPolicyBooleanDisplayValue,
  getSelectorLabelsValue,
} from './utils';

describe('getSelectorLabelsValue', () => {
  it('serializes selector labels as key: value pairs', () => {
    expect(getSelectorLabelsValue({ env: 'prod', team: 'cnv' })).toBe('env: prod, team: cnv');
  });

  it('returns a dash when the selector is empty or missing', () => {
    expect(getSelectorLabelsValue()).toBe(NO_DATA_DASH);
    expect(getSelectorLabelsValue({})).toBe(NO_DATA_DASH);
  });
});

describe('getMigrationPolicyBandwidthDisplayValue', () => {
  it('returns the same humanized string the table shows', () => {
    expect(
      getMigrationPolicyBandwidthDisplayValue({
        spec: { bandwidthPerMigration: '3Mi', selectors: {} },
      } as V1alpha1MigrationPolicy),
    ).toBe('3 MiB');
  });

  it('returns a dash when bandwidth is unset', () => {
    expect(
      getMigrationPolicyBandwidthDisplayValue({
        spec: { selectors: {} },
      } as V1alpha1MigrationPolicy),
    ).toBe(NO_DATA_DASH);
  });
});

describe('getMigrationPolicyBooleanDisplayValue', () => {
  it('returns a dash when the spec key is unset', () => {
    expect(
      getMigrationPolicyBooleanDisplayValue(
        { spec: { selectors: {} } } as V1alpha1MigrationPolicy,
        migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE,
      ),
    ).toBe(NO_DATA_DASH);
  });

  it('returns Yes or No when the spec key is set', () => {
    expect(
      getMigrationPolicyBooleanDisplayValue(
        { spec: { allowAutoConverge: true, selectors: {} } } as V1alpha1MigrationPolicy,
        migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE,
      ),
    ).toBe('Yes');
    expect(
      getMigrationPolicyBooleanDisplayValue(
        { spec: { allowAutoConverge: false, selectors: {} } } as V1alpha1MigrationPolicy,
        migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE,
      ),
    ).toBe('No');
  });
});
