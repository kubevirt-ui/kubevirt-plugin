import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1AddVolumeOptions,
  V1RemoveVolumeOptions,
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  consoleFetch,
  k8sCreate,
  k8sDelete,
  K8sKind,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

export const VirtualMachineInstanceMigrationModel: K8sKind = {
  label: 'Virtual Machine Instance Migration',
  labelPlural: 'Virtual Machine Instance Migrations',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachineinstancemigrations',
  abbr: 'VMIM',
  namespaced: true,
  kind: 'VirtualMachineInstanceMigration',
  id: 'virtualmachineinstancemigration',
  crd: true,
};

const generateRandomString = () => Math.random().toString(36).substring(2, 7);

export enum VMActionType {
  Start = 'start',
  Stop = 'stop',
  Restart = 'restart',
  Pause = 'pause',
  Unpause = 'unpause',
  AddVolume = 'addvolume',
  RemoveVolume = 'removevolume',
}

export const VMActionRequest = async (
  vm: V1VirtualMachine,
  action: VMActionType,
  model: K8sModel,
  body?: V1AddVolumeOptions | V1RemoveVolumeOptions,
) => {
  const {
    metadata: { name, namespace },
  } = vm;

  try {
    // TODO: when this bz resolves https://bugzilla.redhat.com/show_bug.cgi?id=2056656
    // we can do the call to k8sUpdate instead of consoleFetch

    // const promise = await k8sUpdate({
    //   model: { ...VirtualMachineModel, apiGroup: `subresources.${VirtualMachineModel.apiGroup}` },
    //   data: vm,
    //   ns: namespace,
    //   name,
    //   path: action,
    // });
    // Promise.resolve(promise);
    const url = `/api/kubernetes/apis/subresources.${model.apiGroup}/${model.apiVersion}/namespaces/${namespace}/${model.plural}/${name}/${action}`;

    const response = await consoleFetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.text();
  } catch (error) {
    console.error(error);
    return;
  }
};

export const startVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Start, VirtualMachineModel);
export const stopVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Stop, VirtualMachineModel);
export const restartVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Restart, VirtualMachineModel);
export const pauseVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Pause, VirtualMachineInstanceModel);
export const unpauseVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Unpause, VirtualMachineInstanceModel);
export const addPersistentVolume = async (vm: V1VirtualMachine, body: V1AddVolumeOptions) =>
  VMActionRequest(vm, VMActionType.AddVolume, VirtualMachineModel, body);
export const removeVolume = async (vm: V1VirtualMachine, body: V1RemoveVolumeOptions) =>
  VMActionRequest(vm, VMActionType.RemoveVolume, VirtualMachineModel, body);
export const migrateVM = async (vm: V1VirtualMachine) => {
  const { name, namespace } = vm?.metadata;
  const migrationData: V1VirtualMachineInstanceMigration = {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstanceMigration',
    metadata: {
      name: `${name}-migration-${generateRandomString()}`,
    },
    spec: {
      vmiName: name,
    },
  };
  await k8sCreate({
    model: VirtualMachineInstanceMigrationModel,
    data: migrationData,
    ns: namespace,
  });
};

export const cancelMigration = async (vmim: V1VirtualMachineInstanceMigration) => {
  await k8sDelete({
    model: VirtualMachineInstanceMigrationModel,
    resource: vmim,
    json: undefined,
    requestInit: undefined,
  });
};

export const deleteVM = async (vm: V1VirtualMachine) => {
  await k8sDelete({
    model: VirtualMachineModel,
    resource: vm,
    json: undefined,
    requestInit: undefined,
  });
};
