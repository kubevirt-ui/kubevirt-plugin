import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { act, renderHook } from '@testing-library/react';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';
import { type GenerateVMArgs } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';
import {
  createPopulatedCloudInitYAML,
  generateVM,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import { discardGeneratedVMDraft } from '@virtualmachines/wizard/utils/generatedVMDraft';

import useGenerateVM from './useGenerateVM';

const setValue = jest.fn();
const generatedVM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'generated-vm', namespace: 'test-project' },
  spec: { template: { spec: { domain: { devices: {} } } } },
};
let vmData: VMWizardFormValues['vmData'] = {
  autoLabelsMerged: false,
  cluster: 'test-cluster',
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  description: '',
  folder: '',
  name: 'generated-vm',
  project: 'test-project',
  selectedTemplate: null,
};
let instanceTypeData: VMWizardFormValues['instanceTypeData'];
let generatedVMLoaded = true;

jest.mock('react-hook-form', () => ({
  useWatch: jest.fn(() => [vmData, instanceTypeData]),
}));
jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: () => ({ featureEnabled: false }),
}));
jest.mock('@kubevirt-utils/hooks/useHyperConvergeConfiguration', () => () => [{}]);
jest.mock('@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster', () => () => false);
jest.mock('@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings', () => () => [
  {},
]);
jest.mock('@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription', () =>
  jest.fn(() => ({ subscriptionData: {} })),
);
jest.mock('@kubevirt-utils/resources/namespace/hooks/useProjectDefaultNad', () => () => ({
  loaded: generatedVMLoaded,
}));
jest.mock('@kubevirt-utils/resources/udn/hooks/useNamespaceUDN', () => () => [false]);
jest.mock('@kubevirt-utils/resources/vm/utils/disk/useDriversImage', () => ({
  useDriversImage: () => [undefined],
}));
jest.mock('@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext', () => ({
  useVMWizard: () => ({ control: {}, setValue }),
}));
jest.mock('./utils/generateVM', () => ({
  createPopulatedCloudInitYAML: jest.fn(() => 'cloud-init'),
  generateVM: jest.fn(({ context, instanceTypeData: currentInstanceTypeData }: GenerateVMArgs) => ({
    ...generatedVM,
    metadata: { ...generatedVM.metadata, name: context.vmName },
    spec: {
      ...generatedVM.spec,
      instancetype: currentInstanceTypeData.selectedInstanceType
        ? { name: currentInstanceTypeData.selectedInstanceType.name }
        : undefined,
      template: {
        ...generatedVM.spec.template,
        spec: {
          ...generatedVM.spec.template.spec,
          domain: { devices: { disks: [{ name: 'root-disk' }] } },
          volumes: [
            {
              cloudInitNoCloud: { userData: context.populatedCloudInitYAML },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
    },
  })),
  isWindowBootableVolume: jest.fn(() => false),
}));
describe('useGenerateVM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    discardGeneratedVMDraft();
    generatedVMLoaded = true;
    vmData = { ...vmData, name: 'generated-vm' };
    instanceTypeData = {
      customDiskSize: '30Gi',
      dvSource: null,
      operatingSystemType: OperatingSystemType.RHEL,
      preference: { name: 'rhel.9' },
      pvcSource: null,
      selectedBootableVolume: null,
      selectedInstanceType: { name: 'u1.medium', namespace: null },
      selectedSeries: 'u1',
      selectedSize: 'medium',
      useBootSource: false,
      volumeListNamespace: '',
      volumeSnapshotSource: null,
    };
  });

  it('preserves a customized VM when generation inputs have not changed', () => {
    const { result } = renderHook(() => useGenerateVM());

    act(() => expect(result.current.ensureGeneratedVM()).toBe(true));
    const initialGeneratedVM = customizeWizardVMSignal.value;
    const customizedVM = {
      ...initialGeneratedVM,
      metadata: { ...initialGeneratedVM.metadata, labels: { keep: 'me' } },
    };
    customizeWizardVMSignal.value = customizedVM;

    act(() => expect(result.current.ensureGeneratedVM()).toBe(true));

    expect(generateVM).toHaveBeenCalledTimes(1);
    expect(customizeWizardVMSignal.value).toBe(customizedVM);
  });

  it('regenerates the VM without discarding unrelated customization', () => {
    const { rerender, result } = renderHook(() => useGenerateVM());
    act(() => result.current.ensureGeneratedVM());
    const initialGeneratedVM = customizeWizardVMSignal.value;
    customizeWizardVMSignal.value = {
      ...initialGeneratedVM,
      spec: {
        ...initialGeneratedVM.spec,
        dataVolumeTemplates: [
          {
            metadata: { name: 'custom-dv' },
            spec: { storage: { resources: { requests: { storage: '10Gi' } } } },
          },
        ],
        template: {
          ...initialGeneratedVM.spec.template,
          spec: {
            ...initialGeneratedVM.spec.template.spec,
            domain: {
              devices: {
                disks: [
                  ...initialGeneratedVM.spec.template.spec.domain.devices.disks,
                  { name: 'custom-disk' },
                ],
              },
            },
            hostname: 'keep-me',
            volumes: [
              ...initialGeneratedVM.spec.template.spec.volumes,
              { dataVolume: { name: 'custom-dv' }, name: 'custom-disk' },
            ],
          },
        },
      },
    };

    instanceTypeData = {
      ...instanceTypeData,
      selectedInstanceType: { name: 'u1.large', namespace: null },
    };
    rerender();
    act(() => result.current.ensureGeneratedVM());

    expect(generateVM).toHaveBeenCalledTimes(2);
    expect(createPopulatedCloudInitYAML).toHaveBeenCalledTimes(1);
    expect(customizeWizardVMSignal.value.spec.instancetype.name).toBe('u1.large');
    expect(customizeWizardVMSignal.value.spec.template.spec.hostname).toBe('keep-me');
    expect(customizeWizardVMSignal.value.spec.template.spec.domain.devices.disks).toContainEqual({
      name: 'custom-disk',
    });
    expect(customizeWizardVMSignal.value.spec.template.spec.volumes).toContainEqual({
      dataVolume: { name: 'custom-dv' },
      name: 'custom-disk',
    });
    expect(customizeWizardVMSignal.value.spec.dataVolumeTemplates).toHaveLength(1);
  });

  it('uses an unchanged draft while required data is temporarily reloading', () => {
    const { rerender, result } = renderHook(() => useGenerateVM());
    act(() => result.current.ensureGeneratedVM());

    generatedVMLoaded = false;
    rerender();

    expect(result.current.ready).toBe(true);
    act(() => expect(result.current.ensureGeneratedVM()).toBe(true));
    expect(generateVM).toHaveBeenCalledTimes(1);
  });

  it('updates a generated VM name while preserving its hostname', () => {
    const { rerender, result } = renderHook(() => useGenerateVM());
    act(() => result.current.ensureGeneratedVM());
    const initialGeneratedVM = customizeWizardVMSignal.value;
    customizeWizardVMSignal.value = {
      ...initialGeneratedVM,
      spec: {
        ...initialGeneratedVM.spec,
        template: {
          ...initialGeneratedVM.spec.template,
          spec: { ...initialGeneratedVM.spec.template.spec, hostname: 'keep-me' },
        },
      },
    };

    vmData = { ...vmData, name: 'renamed-vm' };
    rerender();
    act(() => result.current.ensureGeneratedVM());

    expect(generateVM).toHaveBeenCalledTimes(2);
    expect(customizeWizardVMSignal.value.metadata.name).toBe('renamed-vm');
    expect(customizeWizardVMSignal.value.spec.template.spec.hostname).toBe('keep-me');
  });

  it('does not generate a VM before required data is loaded', () => {
    generatedVMLoaded = false;
    const { result } = renderHook(() => useGenerateVM());

    act(() => expect(result.current.ensureGeneratedVM()).toBe(false));

    expect(generateVM).not.toHaveBeenCalled();
    expect(customizeWizardVMSignal.value).toBeNull();
  });
});
