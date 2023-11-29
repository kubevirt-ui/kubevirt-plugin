import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { WORKLOADS } from '@kubevirt-utils/resources/template';
import { DESCRIPTION_ANNOTATION, getWorkload } from '@kubevirt-utils/resources/vm';
import { k8sPatch, k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { printableVMStatus } from '@virtualmachines/utils';

export const updateStartStrategy = (checked: boolean, vm: V1VirtualMachine) => {
  k8sPatch({
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

export const updateBootLoader = (updatedVM: V1VirtualMachine) =>
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/firmware/bootloader`,
        value: updatedVM.spec.template.spec.domain.firmware.bootloader,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updatedBootOrder = (updatedVM: V1VirtualMachine) =>
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/disks`,
        value: updatedVM?.spec?.template?.spec?.domain?.devices?.disks,
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/interfaces`,
        value: updatedVM?.spec?.template?.spec?.domain?.devices?.interfaces,
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
  k8sPatch({
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
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/${type}`,
        value: vm?.spec.template.spec.domain.devices?.[type],
      },
    ],
    model: VirtualMachineModel,
    resource: vm,
  });

export const onSubmitYAML = (updatedVM: V1VirtualMachine) =>
  k8sUpdate({
    data: updatedVM,
    model: VirtualMachineModel,
    name: updatedVM?.metadata?.name,
    ns: updatedVM?.metadata?.namespace,
  });

export const updateGuestSystemAccessLog = (updatedVM: V1VirtualMachine, checked: boolean) => {
  return k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/devices/logSerialConsole`,
        value: checked ? null : false,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });
};

export const updateDescription = (updatedVM: V1VirtualMachine, updatedDescription: string) => {
  return k8sPatch({
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

  return k8sPatch({
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
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/domain/cpu/cores`,
        value: updatedVM?.spec?.template?.spec?.domain?.cpu?.cores,
      },
      {
        op: 'replace',
        path: `/spec/template/spec/domain/memory/guest`,
        value: updatedVM?.spec?.template?.spec?.domain?.memory?.guest,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updatedHostname = (updatedVM: V1VirtualMachine) =>
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: `/spec/template/spec/hostname`,
        value: updatedVM?.spec?.template?.spec?.hostname,
      },
    ],
    model: VirtualMachineModel,
    resource: updatedVM,
  });

export const updateHeadlessMode = (updatedVM: V1VirtualMachine, checked: boolean) =>
  k8sPatch({
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
