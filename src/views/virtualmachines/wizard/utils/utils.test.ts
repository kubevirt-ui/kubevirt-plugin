import { useForm } from 'react-hook-form';

import { DEFAULT_INSTANCETYPE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { cancelAllWizardPendingUploads } from '@kubevirt-utils/hooks/useUploadProgressToast';
import { act, renderHook } from '@testing-library/react';

import { createVMWizardDefaultValues, resetCreationMethodValues } from '../form/defaultValues';
import { type VMWizardFormValues } from '../form/types';
import { VMCreationMethod } from './constants';
import {
  applySelectedBootableVolumeToForm,
  clearVMPendingUploads,
  resetBootableVolumeFields,
} from './utils';
jest.mock('@kubevirt-utils/hooks/useUploadProgressToast', () => ({
  cancelAllWizardPendingUploads: jest.fn(),
}));
const setup = () =>
  renderHook(() => useForm<VMWizardFormValues>({ defaultValues: createVMWizardDefaultValues() }))
    .result;

describe('wizard form mappings', () => {
  it('creates isolated nullable defaults and retains initial placement and name behavior', () => {
    const first = createVMWizardDefaultValues({ cluster: 'remote', namespace: 'test' });
    expect(first.deployment).toEqual({
      cluster: 'remote',
      description: '',
      folder: '',
      name: undefined,
      project: 'test',
    });
    expect(first.instanceType.bootVolume).toBeNull();
    expect(first.instanceType.compute).toBeNull();
    expect(first.clone.sourceVM).toBeNull();
    expect(first.customization.vmDraft).toBeNull();
    first.customization.pendingBootableVolumeUploadKeys.push('upload');
    expect(createVMWizardDefaultValues().customization.pendingBootableVolumeUploadKeys).toEqual([]);
  });
  it('maps a boot selection and clears its dependent compute choice on reset', () => {
    const result = setup();
    const volume = {
      metadata: { labels: { [DEFAULT_INSTANCETYPE_LABEL]: 'u1.small' }, name: 'boot' },
    };
    const pvc = { spec: { resources: { requests: { storage: '20Gi' } } } };
    act(() =>
      applySelectedBootableVolumeToForm({
        ...result.current,
        dvSource: null,
        pvcSource: pvc,
        selectedVolume: volume,
        volumeSnapshotSource: null,
      }),
    );
    expect(result.current.getValues('instanceType.bootVolume')).toEqual({
      dataVolumeSource: null,
      diskSize: '20Gi',
      persistentVolumeClaimSource: pvc,
      volume,
      volumeSnapshotSource: null,
    });
    expect(result.current.getValues('instanceType.compute')).toEqual({
      name: 'u1.small',
      series: 'u1',
      size: 'small',
      type: 'redhat',
    });
    act(() => resetBootableVolumeFields(result.current.setValue));
    expect(result.current.getValues('instanceType.bootVolume')).toBeNull();
    expect(result.current.getValues('instanceType.compute')).toBeNull();
  });
  it('cancels the current draft and boot uploads before reset', () => {
    const result = setup();
    const vm = { metadata: { name: 'draft', namespace: 'test' }, spec: { template: {} } };
    const deployment = {
      cluster: 'remote',
      description: 'Keep description',
      folder: 'group',
      name: 'draft',
      project: 'test',
    };
    act(() => {
      result.current.setValue('deployment', deployment);
      result.current.setValue('customization.vmDraft', vm);
      result.current.setValue('customization.pendingBootableVolumeUploadKeys', ['boot-upload']);
      clearVMPendingUploads(result.current.getValues, result.current.setValue);
    });
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith(vm, ['boot-upload']);
    expect(result.current.getValues('customization.pendingBootableVolumeUploadKeys')).toEqual([]);
    act(() =>
      result.current.reset(
        resetCreationMethodValues(result.current.getValues(), VMCreationMethod.TEMPLATE),
      ),
    );
    expect(result.current.getValues('deployment')).toEqual(deployment);
    expect(result.current.getValues('creationMethod')).toBe(VMCreationMethod.TEMPLATE);
    expect(result.current.getValues('customization.vmDraft')).toBeNull();
    expect(result.current.getValues('template')).toEqual({
      lastProcessedKey: '',
      selectedTemplate: null,
    });
  });
});
