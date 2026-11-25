import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  filterResourcesByAllowedPreferences,
  resourceMatchesAllowedPreferences,
} from './preferenceLabelFilter';

const withPreference = (preference?: string): K8sResourceCommon => ({
  metadata: {
    labels: preference ? { [DEFAULT_PREFERENCE_LABEL]: preference } : {},
    name: preference ?? 'unlabeled',
  },
});

describe('resourceMatchesAllowedPreferences', () => {
  it('keeps all resources when no allowed preferences are set', () => {
    expect(resourceMatchesAllowedPreferences(withPreference('fedora'), [])).toBe(true);
    expect(resourceMatchesAllowedPreferences(withPreference('fedora'), undefined)).toBe(true);
  });

  it('keeps unlabeled resources even when preferences are locked', () => {
    expect(resourceMatchesAllowedPreferences(withPreference(), ['rhel.10'])).toBe(true);
  });

  it('keeps matching OS family labels', () => {
    expect(resourceMatchesAllowedPreferences(withPreference('rhel.10'), ['rhel.10'])).toBe(true);
    expect(resourceMatchesAllowedPreferences(withPreference('rhel10'), ['rhel.10'])).toBe(true);
    expect(resourceMatchesAllowedPreferences(withPreference('rhel.9'), ['rhel.10'])).toBe(true);
  });

  it('hides different OS family labels', () => {
    expect(resourceMatchesAllowedPreferences(withPreference('fedora'), ['rhel.10'])).toBe(false);
    expect(resourceMatchesAllowedPreferences(withPreference('windows.2k22'), ['rhel.10'])).toBe(
      false,
    );
  });

  it('filters a list of resources', () => {
    const resources = [
      withPreference('fedora'),
      withPreference('rhel.10'),
      withPreference(),
      withPreference('centos.stream9'),
    ];

    expect(
      filterResourcesByAllowedPreferences(resources, ['rhel.10']).map((r) => r.metadata.name),
    ).toEqual(['rhel.10', 'unlabeled']);
  });
});
