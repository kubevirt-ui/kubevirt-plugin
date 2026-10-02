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
  clearWizardDraftPendingUploads,
  resetBootableVolumeFields,
  trackWizardPendingUploadKey,
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
    first.customization.pendingUploadKeys.push('upload');
    expect(createVMWizardDefaultValues().customization.pendingUploadKeys).toEqual([]);
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
  it('retains deduplicated upload keys when the draft is cleared', () => {
    const result = setup();
    act(() => {
      for (const key of ['boot', 'disk', 'cdrom', 'disk']) {
        trackWizardPendingUploadKey(result.current.getValues, result.current.setValue, key);
      }
      result.current.setValue('customization.vmDraft', null);
      clearVMPendingUploads(result.current.getValues, result.current.setValue);
    });
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith(['boot', 'disk', 'cdrom']);
    expect(result.current.getValues('customization.pendingUploadKeys')).toEqual([]);
  });
  it('cancels draft uploads on location change and retains boot uploads for exit cleanup', () => {
    const result = setup();
    const bootKey = 'bootable-volume/namespace/image';
    const diskKey = 'vm-disk/cluster/namespace/draft/disk';
    const cdromKey = 'vm-cdrom/cluster/namespace/draft/cdrom';
    act(() => {
      result.current.setValue('customization.pendingUploadKeys', [bootKey, diskKey, cdromKey]);
      clearWizardDraftPendingUploads(result.current.getValues, result.current.setValue);
    });
    expect(cancelAllWizardPendingUploads).toHaveBeenLastCalledWith([diskKey, cdromKey]);
    expect(result.current.getValues('customization.pendingUploadKeys')).toEqual([bootKey]);
    act(() => clearVMPendingUploads(result.current.getValues, result.current.setValue));
    expect(cancelAllWizardPendingUploads).toHaveBeenLastCalledWith([bootKey]);
    expect(result.current.getValues('customization.pendingUploadKeys')).toEqual([]);
  });
  it('cancels registered uploads before reset', () => {
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
      result.current.setValue('customization.pendingUploadKeys', ['boot-upload']);
      clearVMPendingUploads(result.current.getValues, result.current.setValue);
    });
    expect(cancelAllWizardPendingUploads).toHaveBeenCalledWith(['boot-upload']);
    expect(result.current.getValues('customization.pendingUploadKeys')).toEqual([]);
    act(() =>
      result.current.reset(
        resetCreationMethodValues(result.current.getValues(), VMCreationMethod.TEMPLATE),
      ),
    );
    expect(result.current.getValues('deployment')).toEqual(deployment);
    expect(result.current.getValues('creationMethod')).toBe(VMCreationMethod.TEMPLATE);
    expect(result.current.getValues('customization.vmDraft')).toBeNull();
    expect(result.current.getValues('template')).toEqual({
      bootSourceOverride: null,
      selectedTemplate: null,
    });
  });
});
