import { VirtualMachineInstanceMigrationModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1AddVolumeOptions,
  V1RemoveVolumeOptions,
  V1StopOptions,
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  getKubevirtBaseAPIPath,
  kubevirtK8sCreate,
  kubevirtK8sDelete,
} from '@multicluster/k8sRequests';
import { consoleFetch, K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const generateRandomString = () => Math.random().toString(36).substring(2, 7);

export enum VMActionType {
  AddVolume = 'addvolume',
  Pause = 'pause',
  RemoveVolume = 'removevolume',
  Reset = 'reset',
  Restart = 'restart',
  Start = 'start',
  Stop = 'stop',
  Unpause = 'unpause',
}

export type VMActionRequestParams = {
  action: VMActionType;
  body?: V1AddVolumeOptions | V1RemoveVolumeOptions | V1StopOptions;
  model: K8sModel;
  safe?: boolean;
  vm: V1VirtualMachine;
};

export const VMActionRequest = async ({
  action,
  body,
  model,
  safe = true,
  vm,
}: VMActionRequestParams): Promise<string | void> => {
  const {
    metadata: { name, namespace },
  } = vm;
  try {
    const k8sAPIPath = await getKubevirtBaseAPIPath(getCluster(vm));
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
    if (safe) {
      kubevirtConsole.error(error);
      return;
    }

    const message =
      error instanceof Error ? error.message : `Failed to ${action} VirtualMachine ${name}`;
    kubevirtConsole.error(error);
    throw new Error(message);
  }
};

export const startVM = async (vm: V1VirtualMachine, safe = true): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Start, model: VirtualMachineModel, safe, vm });
export const stopVM = async (
  vm: V1VirtualMachine,
  safe = true,
  body?: V1StopOptions,
): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Stop, body, model: VirtualMachineModel, safe, vm });
export const restartVM = async (vm: V1VirtualMachine, safe = true): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Restart, model: VirtualMachineModel, safe, vm });
export const resetVM = async (vm: V1VirtualMachine, safe = true): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Reset, model: VirtualMachineInstanceModel, safe, vm });
export const pauseVM = async (vm: V1VirtualMachine, safe = true): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Pause, model: VirtualMachineInstanceModel, safe, vm });
export const unpauseVM = async (vm: V1VirtualMachine, safe = true): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.Unpause, model: VirtualMachineInstanceModel, safe, vm });
export const addPersistentVolume = async (
  vm: V1VirtualMachine,
  body: V1AddVolumeOptions,
): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.AddVolume, body, model: VirtualMachineModel, vm });
export const removeVolume = async (
  vm: V1VirtualMachine,
  body: V1RemoveVolumeOptions,
): Promise<string | void> =>
  VMActionRequest({ action: VMActionType.RemoveVolume, body, model: VirtualMachineModel, vm });
export const migrateVM = async (vm: V1VirtualMachine, node?: string) => {
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

  if (node) migrationData.spec.addedNodeSelector = { 'kubernetes.io/hostname': node };

  await kubevirtK8sCreate({
    cluster: getCluster(vm),
    data: migrationData,
    model: VirtualMachineInstanceMigrationModel,
    ns: namespace,
  });
};

export const cancelMigration = async (vmim: V1VirtualMachineInstanceMigration) => {
  await kubevirtK8sDelete({
    cluster: vmim?.cluster,
    model: VirtualMachineInstanceMigrationModel,
    resource: vmim,
  });
};

export const deleteVM = async (vm: V1VirtualMachine) => {
  await kubevirtK8sDelete({
    cluster: getCluster(vm),
    model: VirtualMachineModel,
    resource: vm,
  });
};
