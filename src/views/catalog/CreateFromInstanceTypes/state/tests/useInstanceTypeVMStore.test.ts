import { instanceTypeVMStoreInitialState } from '@catalog/CreateFromInstanceTypes/state/utils/state';
import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';

import { useInstanceTypeVMStore } from '../useInstanceTypeVMStore';

jest.mock('@multicluster/k8sRequests', () => ({
  kubevirtK8sCreate: jest.fn(),
}));

const volumeWithInstanceType = (instanceType?: string): BootableVolume =>
  ({
    metadata: {
      labels: instanceType ? { [DEFAULT_INSTANCETYPE_LABEL]: instanceType } : {},
      name: 'rhel9',
      namespace: 'openshift-virtualization-os-images',
    },
  } as unknown as BootableVolume);

const selectVolume = (
  volume: BootableVolume,
  familyAvailability?: Parameters<
    ReturnType<typeof useInstanceTypeVMStore.getState>['onSelectCreatedVolume']
  >[4],
) =>
  useInstanceTypeVMStore
    .getState()
    .onSelectCreatedVolume(volume, undefined, undefined, undefined, familyAvailability);

const getSelectedInstanceType = () =>
  useInstanceTypeVMStore.getState().instanceTypeVMState.selectedInstanceType;

describe('useInstanceTypeVMStore.onSelectCreatedVolume', () => {
  beforeEach(() => {
    useInstanceTypeVMStore.setState({ ...instanceTypeVMStoreInitialState });
  });

  it('applies the volume default instance type when no availability info is given', () => {
    selectVolume(volumeWithInstanceType('u1.medium'));

    expect(getSelectedInstanceType()).toEqual({ name: 'u1.medium', namespace: null });
  });

  it('applies the default when its family is visible and families are loaded', () => {
    selectVolume(volumeWithInstanceType('u1.medium'), {
      familiesLoaded: true,
      isFamilyVisible: () => true,
    });

    expect(getSelectedInstanceType().name).toBe('u1.medium');
  });

  it('clears the instance type when the volume default family is disabled', () => {
    selectVolume(volumeWithInstanceType('u1.medium'), {
      familiesLoaded: true,
      isFamilyVisible: (series) => series !== 'u1',
    });

    expect(getSelectedInstanceType()).toEqual({ name: '', namespace: null });
  });

  it('clears the instance type when family availability has not loaded yet', () => {
    selectVolume(volumeWithInstanceType('u1.medium'), {
      familiesLoaded: false,
      isFamilyVisible: () => true,
    });

    expect(getSelectedInstanceType().name).toBe('');
  });

  it('keeps user-provided instance types regardless of family availability', () => {
    selectVolume(volumeWithInstanceType('my-custom-it'), {
      familiesLoaded: false,
      isFamilyVisible: () => false,
    });

    expect(getSelectedInstanceType().name).toBe('my-custom-it');
  });

  it('still selects the volume when the instance type is cleared', () => {
    const volume = volumeWithInstanceType('u1.medium');
    selectVolume(volume, { familiesLoaded: true, isFamilyVisible: () => false });

    expect(useInstanceTypeVMStore.getState().instanceTypeVMState.selectedBootableVolume).toBe(
      volume,
    );
  });

  it('leaves the instance type empty when the volume has no default instance type', () => {
    selectVolume(volumeWithInstanceType(), { familiesLoaded: true, isFamilyVisible: () => true });

    expect(getSelectedInstanceType().name).toBe('');
  });
});
