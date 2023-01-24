import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';

import { DEFAULT_INSTANCETYPE_LABEL, DEFAULT_PREFERENCE_LABEL } from './constants';

export const produceVirtualMachine = (
  dataSource: V1beta1DataSource,
  activeNamespace: string,
  instanceTypeName: string,
  vmName?: string,
) => {
  const virtualmachineName =
    vmName ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
    });

  const targetNamespace =
    activeNamespace !== ALL_NAMESPACES_SESSION_KEY ? activeNamespace : DEFAULT_NAMESPACE;

  const emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: virtualmachineName,
      namespace: targetNamespace,
    },
    spec: {
      running: true,
      template: {
        spec: {
          domain: { devices: {} },
          volumes: [
            {
              dataVolume: { name: `${virtualmachineName}-volume` },
              name: `${virtualmachineName}-disk`,
            },
          ],
        },
      },
      instancetype: {
        // inferFromVolume: `${virtualmachineName}-disk`,
        name: instanceTypeName || dataSource?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        // inferFromVolume: `${virtualmachineName}-disk`,
        name: dataSource?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      },
      dataVolumeTemplates: [
        {
          metadata: {
            name: `${virtualmachineName}-volume`,
          },
          spec: {
            sourceRef: {
              kind: DataSourceModel.kind,
              name: dataSource?.metadata?.name,
              namespace: dataSource?.metadata?.namespace,
            },
            storage: { resources: { requests: { storage: '' } } },
          },
        },
      ],
    },
  };

  return emptyVM;
};
