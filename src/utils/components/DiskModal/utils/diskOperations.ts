import produce from 'immer';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1DataVolumeTemplateSpec,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  getCustomizeWizardVM,
  updateVMCustomizeIT,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';
import { updateDisks } from '@virtualmachines/details/tabs/configuration/details/utils/utils';

import { type V1DiskFormState } from './types';
import { runExclusiveForVm } from './vmCancelCleanupQueue';
import { produceVMDisks } from './vmProducers';

type VolumeSourceForMount =
  | { dataVolume: { hotpluggable?: boolean; name: string } }
  | { persistentVolumeClaim: { claimName: string; hotpluggable?: boolean } };

const getVolumeSourceForMount = (
  diskState: V1DiskFormState,
  isHotPluggable: boolean,
): VolumeSourceForMount => {
  if (diskState.dataVolumeTemplate) {
    return {
      dataVolume: {
        name: diskState.dataVolumeTemplate.metadata.name,
        ...(isHotPluggable && { hotpluggable: true }),
      },
    };
  }

  if (diskState.volume?.dataVolume?.name) {
    return {
      dataVolume: {
        name: diskState.volume.dataVolume.name,
        ...(isHotPluggable && { hotpluggable: true }),
      },
    };
  }

  return {
    persistentVolumeClaim: {
      claimName: diskState.volume.persistentVolumeClaim.claimName,
      ...(isHotPluggable && { hotpluggable: true }),
    },
  };
};

export const mountISOToCDROM = async (
  vm: V1VirtualMachine,
  diskState: V1DiskFormState,
  isHotPluggable: boolean,
): Promise<V1VirtualMachine> => {
  const newVolumeSource = getVolumeSourceForMount(diskState, isHotPluggable);

  return produceVMDisks(vm, (draftVM) => {
    // Find the index of the existing CD-ROM volume, if it exists
    const volumes = draftVM.spec.template.spec.volumes ?? [];
    const volumeIndex = volumes.findIndex((volume) => volume.name === diskState.disk.name);

    const newVolume = {
      name: diskState.disk.name,
      ...newVolumeSource,
    };

    if (volumeIndex !== -1) {
      draftVM.spec.template.spec.volumes[volumeIndex] = newVolume;
    } else {
      draftVM.spec.template.spec.volumes = [...volumes, newVolume];
    }

    if (diskState.dataVolumeTemplate) {
      const templates = draftVM.spec.dataVolumeTemplates ?? [];
      const templateName = getName(diskState.dataVolumeTemplate as V1DataVolumeTemplateSpec);
      const hasTemplate = templates.some(
        (template) => getName(template as V1DataVolumeTemplateSpec) === templateName,
      );

      if (!hasTemplate) {
        draftVM.spec.dataVolumeTemplates = [...templates, diskState.dataVolumeTemplate];
      }
    }
  });
};

export const ejectISOFromCDROM = (vm: V1VirtualMachine, cdromName: string): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    // Find the volume to be removed
    const volumeToRemove = (draftVM.spec.template.spec.volumes ?? []).find(
      (volume) => volume.name === cdromName,
    );

    // If a DataVolume was used, remove its template
    if (volumeToRemove?.dataVolume?.name) {
      draftVM.spec.dataVolumeTemplates = (draftVM.spec.dataVolumeTemplates ?? []).filter(
        (dataVolume) => dataVolume.metadata.name !== volumeToRemove.dataVolume.name,
      );
    }

    // Remove the volume entry - empty CD-ROM means disk exists but no volume
    draftVM.spec.template.spec.volumes = (draftVM.spec.template.spec.volumes ?? []).filter(
      (volume) => volume.name !== cdromName,
    );
  });
};

export const detachDiskFromVM = (vm: V1VirtualMachine, diskName: string): V1VirtualMachine => {
  return produceVMDisks(vm, (draftVM) => {
    const volumeToRemove = (draftVM.spec.template.spec.volumes ?? []).find(
      (volume) => volume.name === diskName,
    );

    draftVM.spec.template.spec.domain.devices.disks = (
      draftVM.spec.template.spec.domain.devices.disks ?? []
    ).filter((disk) => disk.name !== diskName);

    draftVM.spec.template.spec.volumes = (draftVM.spec.template.spec.volumes ?? []).filter(
      (volume) => volume.name !== diskName,
    );

    if (volumeToRemove?.dataVolume?.name) {
      draftVM.spec.dataVolumeTemplates = (draftVM.spec.dataVolumeTemplates ?? []).filter(
        (dvt) => dvt.metadata?.name !== volumeToRemove.dataVolume.name,
      );
    }
  });
};

// All disk cancel-cleanups for the same VM must run one at a time (see runExclusiveForVm),
// since each one reads the VM, transforms it, and patches it back.
// If the VM only exists as an in-memory draft (the creation wizard), the wizard signal is
// the live source of truth: patch it instead of re-fetching from the cluster, since the
// draft VM has never been persisted and kubevirtK8sGet would fail.
const CUSTOMIZE_WIZARD_DRAFT_QUEUE_KEY = 'customize-wizard-draft';

const getVmCancelCleanupQueueKey = (vm: V1VirtualMachine): string =>
  getCustomizeWizardVM()
    ? CUSTOMIZE_WIZARD_DRAFT_QUEUE_KEY
    : `${getCluster(vm) ?? ''}/${getNamespace(vm) ?? ''}/${getName(vm) ?? ''}`;

const createDiskCancelCleanup =
  (
    vm: V1VirtualMachine,
    diskName: string,
    transform: (vm: V1VirtualMachine, name: string) => V1VirtualMachine,
  ): (() => Promise<void>) =>
  () => {
    const vmKey = getVmCancelCleanupQueueKey(vm);

    return runExclusiveForVm(vmKey, async () => {
      const draftVM = getCustomizeWizardVM();

      if (draftVM) {
        await updateVMCustomizeIT(transform(draftVM, diskName));
        return;
      }

      const freshVM = await kubevirtK8sGet<V1VirtualMachine>({
        cluster: getCluster(vm),
        model: VirtualMachineModel,
        name: getName(vm),
        ns: getNamespace(vm),
      });
      await updateDisks(transform(freshVM, diskName));
    });
  };

export const createEjectMountedDiskCancelCleanup = (
  vm: V1VirtualMachine,
  diskName: string,
): (() => Promise<void>) => createDiskCancelCleanup(vm, diskName, ejectISOFromCDROM);

export const createDetachDiskCancelCleanup = (
  vm: V1VirtualMachine,
  diskName: string,
): (() => Promise<void>) => createDiskCancelCleanup(vm, diskName, detachDiskFromVM);
