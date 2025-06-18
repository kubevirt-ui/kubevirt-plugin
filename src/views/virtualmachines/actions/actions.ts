import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1AddVolumeOptions,
  V1RemoveVolumeOptions,
  V1StopOptions,
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { consoleFetch, K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { fleetK8sCreate, fleetK8sDelete, getFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

const generateRandomString = () => Math.random().toString(36).substring(2, 7);

export enum VMActionType {
  AddVolume = 'addvolume',
  Pause = 'pause',
  RemoveVolume = 'removevolume',
  Restart = 'restart',
  Start = 'start',
  Stop = 'stop',
  Unpause = 'unpause',
}

export const VMActionRequest = async (
  vm: V1VirtualMachine,
  action: VMActionType,
  model: K8sModel,
  body?: V1AddVolumeOptions | V1RemoveVolumeOptions | V1StopOptions,
) => {
  const {
    metadata: { name, namespace },
  } = vm;

  try {
    const k8sAPIPath = await getFleetK8sAPIPath(vm?.cluster);
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
    const url = `${k8sAPIPath}/apis/subresources.${model.apiGroup}/${model.apiVersion}/namespaces/${namespace}/${model.plural}/${name}/${action}`;

    const response = await consoleFetch(url, {
      body: body ? JSON.stringify(body) : undefined,
      method: 'PUT',
    });

    return response.text();
  } catch (error) {
    kubevirtConsole.error(error);
    return;
  }
};

export const startVM = async (vm: V1VirtualMachine) =>
  VMActionRequest(vm, VMActionType.Start, VirtualMachineModel);
export const stopVM = async (vm: V1VirtualMachine, body?: V1StopOptions) =>
  VMActionRequest(vm, VMActionType.Stop, VirtualMachineModel, body);
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
  await fleetK8sCreate({
    cluster: vm?.cluster,
    data: migrationData,
    model: VirtualMachineInstanceMigrationModel,
    ns: namespace,
  });
};

export const cancelMigration = async (vmim: V1VirtualMachineInstanceMigration) => {
  await fleetK8sDelete({
    cluster: vmim?.cluster,
    model: VirtualMachineInstanceMigrationModel,
    resource: vmim,
  });
};

export const deleteVM = async (vm: V1VirtualMachine) => {
  await fleetK8sDelete({
    cluster: vm?.cluster,
    model: VirtualMachineModel,
    resource: vm,
  });
};
