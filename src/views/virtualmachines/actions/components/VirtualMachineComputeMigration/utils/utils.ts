import VirtualMachineInstanceMigrationModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceMigrationModel';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { generateRandomString } from '@virtualmachines/actions/actions';

export const migrateVM = async (vm: V1VirtualMachine, node?: string) => {
  const { name, namespace } = vm?.metadata;
  const migrationData: V1VirtualMachineInstanceMigration = {
    apiVersion: `${VirtualMachineInstanceMigrationModel.apiGroup}/${VirtualMachineInstanceMigrationModel.apiVersion}`,
    kind: VirtualMachineInstanceMigrationModel.kind,
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
