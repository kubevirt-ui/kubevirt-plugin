import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { WORKLOADS } from '@kubevirt-utils/resources/template';
import {
  DESCRIPTION_ANNOTATION,
  getBootloader,
  getCPU,
  getDataVolumeTemplates,
  getDevices,
  getDisks,
  getDomainFeatures,
  getHostname,
  getInterfaces,
  getMemory,
  getVolumes,
  getWorkload,
} from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch, kubevirtK8sUpdate } from '@multicluster/k8sRequests';
import { printableVMStatus } from '@virtualmachines/utils';

export const updateStartStrategy = (checked: boolean, vm: V1VirtualMachine) => {
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/startStrategy`,
        value: checked ? printableVMStatus.Paused : null,
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });
};

export const updateBootLoader = (updatedVM: V1VirtualMachine, vm: V1VirtualMachine) => {
  const bootLoaderBeforeUpdate = getBootloader(vm);
  const isEfiSecure = getBootloader(updatedVM)?.efi?.secureBoot;
  const domainFeatures = getDomainFeatures(vm);

  const hasSMMFeatureDefined = domainFeatures?.smm !== undefined;

  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: bootLoaderBeforeUpdate ? 'replace' : 'add',
        path: `/spec/template/spec/domain/firmware`,
        value: { bootloader: getBootloader(updatedVM) },
      },
      ...(isEfiSecure
        ? [
            {
              op: 'add',
              path: `/spec/template/spec/domain/features`,
              value: {},
            },
            {
              op: hasSMMFeatureDefined ? 'replace' : 'add',
              path: `/spec/template/spec/domain/features/smm`,
              value: { enabled: true },
            },
          ]
        : []),
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updateBootOrder = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: getDisks(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/interfaces`,
        value: getInterfaces(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateMetadata = (
  updatedVM: V1VirtualMachine,
  data: { [key: string]: string },
  type: string,
) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/metadata/${type}`,
        value: data,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateAnnotation = (updatedVM: V1VirtualMachine, data: { [key: string]: string }) =>
  updateMetadata(updatedVM, data, 'annotations');

export const updateLabels = (updatedVM: V1VirtualMachine, data: { [key: string]: string }) =>
  updateMetadata(updatedVM, data, 'labels');

export const updateHardwareDevices = (type: string, vm: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/${type}`,
        value: getDevices(vm)?.[type],
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });

export const onSubmitYAML = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sUpdate({
    cluster: getCluster(updatedVM),
    data: updatedVM,
    model: VirtualMachineModel,
    name: getName(updatedVM),
    ns: getNamespace(updatedVM),
  });

export const updateGuestSystemAccessLog = (updatedVM: V1VirtualMachine, checked: boolean) => {
  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/logSerialConsole`,
        value: checked,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updateDescription = (updatedVM: V1VirtualMachine, updatedDescription: string) => {
  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/metadata/annotations/${DESCRIPTION_ANNOTATION}`,
        value: updatedDescription,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updateWorkload = (updatedVM: V1VirtualMachine, newWorkload: WORKLOADS) => {
  const vmWorkload = getWorkload(updatedVM);
  if (vmWorkload === newWorkload) return;

  return kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/metadata/annotations/vm.kubevirt.io~1workload`,
        value: newWorkload,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updatedVirtualMachine = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/cpu`,
        value: getCPU(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/memory/guest`,
        value: getMemory(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updatedInstanceType = (
  vmToBeUpdated: V1VirtualMachine,
  instanceType: V1beta1VirtualMachineClusterInstancetype | V1beta1VirtualMachineInstancetype,
) =>
  kubevirtK8sPatch({
    cluster: vmToBeUpdated?.cluster,
    data: [
      {
        op: 'replace',
        path: `/spec/instancetype`,
        value: { kind: instanceType.kind, name: instanceType.metadata.name },
      },
    ],
    model: VirtualMachineModel,
    resource: vmToBeUpdated,
  });

export const updatedHostname = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/hostname`,
        value: getHostname(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateHeadlessMode = (updatedVM: V1VirtualMachine, checked: boolean) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/autoattachGraphicsDevice`,
        value: checked ? false : null,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateDisks = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: getDisks(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/template/spec/volumes`,
        value: getVolumes(updatedVM),
      },
      {
        op: 'replace',
        path: `/spec/dataVolumeTemplates`,
        value: getDataVolumeTemplates(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateVolumes = (updatedVM: V1VirtualMachine) =>
  kubevirtK8sPatch({
    cluster: getCluster(updatedVM),
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/volumes`,
        value: getVolumes(updatedVM),
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
