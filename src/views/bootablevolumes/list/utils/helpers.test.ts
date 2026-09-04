import { type TFunction } from 'i18next';

import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { buildCSVContent } from '@kubevirt-utils/hooks/useTableExport/exportToCSV';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { type BootableResource } from '../../utils/types';
import {
  BOOTABLE_VOLUME_COLUMN_KEYS,
  type BootableVolumeCallbacks,
  getBootableVolumeColumns,
} from '../bootableVolumesDefinition';

import { getBootableVolumeOSDisplayValue } from './helpers';

jest.mock('../cells/BootableVolumeActionsCell', () => ({ __esModule: true, default: () => null }));
jest.mock('../cells/BootableVolumeArchitectureCell', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../cells/BootableVolumeClusterCell', () => ({ __esModule: true, default: () => null }));
jest.mock('../cells/BootableVolumeDescriptionCell', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../cells/BootableVolumeNameCell', () => ({ __esModule: true, default: () => null }));
jest.mock('../cells/BootableVolumeNamespaceCell', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../cells/BootableVolumeOSCell', () => ({ __esModule: true, default: () => null }));
jest.mock('../cells/BootableVolumePreferenceCell', () => ({
  __esModule: true,
  default: () => null,
}));

const t = ((key: string) => key) as TFunction;

const alpinePreference = {
  metadata: {
    annotations: { [ANNOTATIONS.displayName]: 'Alpine' },
    name: 'alpine',
  },
} as unknown as V1beta1VirtualMachineClusterPreference;

const volume = {
  metadata: {
    annotations: { [ANNOTATIONS.description]: 'test-desc' },
    labels: {
      [DEFAULT_PREFERENCE_LABEL]: 'alpine',
      'template.kubevirt.io/architecture': 'amd64',
    },
    name: 'test-gal-amd64',
    namespace: 'gal',
  },
} as unknown as BootableResource;

const createCallbacks = (
  clusterParam: string | null,
  preferences: V1beta1VirtualMachineClusterPreference[] = [alpinePreference],
): BootableVolumeCallbacks => ({
  clusterParam,
  dataImportCrons: [],
  dvSources: {},
  preferences,
});

describe('getBootableVolumeOSDisplayValue', () => {
  it('returns a dash on a namespaced page when clusterParam is null', () => {
    expect(getBootableVolumeOSDisplayValue(volume, createCallbacks(null))).toBe(NO_DATA_DASH);
  });

  it('returns the preference display name when the cluster matches', () => {
    const clusteredPreference = {
      ...alpinePreference,
      cluster: 'local',
    } as unknown as V1beta1VirtualMachineClusterPreference;
    const clusteredVolume = { ...volume, cluster: 'local' } as unknown as BootableResource;

    expect(
      getBootableVolumeOSDisplayValue(
        clusteredVolume,
        createCallbacks('local', [clusteredPreference]),
      ),
    ).toBe('Alpine');
  });
});

describe('bootable volume CSV operating system column', () => {
  it('matches the table dash instead of the preference display name', () => {
    const csv = buildCSVContent(
      [volume],
      getBootableVolumeColumns(t, false, false),
      [
        BOOTABLE_VOLUME_COLUMN_KEYS.name,
        BOOTABLE_VOLUME_COLUMN_KEYS.os,
        BOOTABLE_VOLUME_COLUMN_KEYS.preference,
      ],
      createCallbacks(null),
    );

    expect(csv).toContain(`test-gal-amd64,${NO_DATA_DASH},alpine`);
    expect(csv).not.toContain('Alpine');
  });
});
