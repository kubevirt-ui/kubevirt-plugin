import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import DataSourceModel, {
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';

import { InstanceTypeVMState } from '../state/utils/types';

import { DEFAULT_INSTANCETYPE_LABEL, DEFAULT_PREFERENCE_LABEL } from './constants';
import { BootableVolume } from './types';

const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

export const generateVM = (
  instanceTypeState: InstanceTypeVMState,
  targetNamespace: string,
  startVM: boolean,
) => {
  const { vmName, selectedInstanceType, selectedBootableVolume, pvcSource, sshSecretCredentials } =
    instanceTypeState;
  const { sshSecretName } = sshSecretCredentials;
  const virtualmachineName =
    vmName ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
    });

  const sourcePVC = {
    name: getName(selectedBootableVolume),
    namespace: getNamespace(selectedBootableVolume),
  };

  const emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: virtualmachineName,
      namespace: targetNamespace,
    },
    spec: {
      running: startVM,
      template: {
        spec: {
          domain: {
            devices: {
              disks: [
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: `${virtualmachineName}-disk`,
                },
                {
                  disk: {
                    bus: 'virtio',
                  },
                  name: 'cloudinitdisk',
                },
              ],
            },
          },
          volumes: [
            {
              dataVolume: { name: `${virtualmachineName}-volume` },
              name: `${virtualmachineName}-disk`,
            },
            {
              cloudInitNoCloud: {
                userData: `#cloud-config\nuser: fedora\npassword: ${generateCloudInitPassword()}\nchpasswd: { expire: False }`,
              },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
      instancetype: {
        name:
          selectedInstanceType ||
          selectedBootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        name: selectedBootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      },
      dataVolumeTemplates: [
        {
          metadata: {
            name: `${virtualmachineName}-volume`,
          },
          spec: {
            ...(isBootableVolumePVCKind(selectedBootableVolume)
              ? {
                  source: {
                    pvc: { ...sourcePVC },
                  },
                }
              : {
                  sourceRef: {
                    kind: DataSourceModel.kind,
                    ...sourcePVC,
                  },
                }),
            storage: {
              storageClassName: pvcSource?.spec?.storageClassName,
              resources: { requests: { storage: pvcSource?.spec?.resources?.requests?.storage } },
            },
          },
        },
      ],
    },
  };

  const vmToCreate = addSecretToVM(emptyVM, sshSecretName);

  return vmToCreate;
};

export const isBootableVolumePVCKind = (bootableVolume: BootableVolume): boolean =>
  bootableVolume?.kind !== DataSourceModel.kind;

export const getBootableVolumeGroupVersionKind = (bootableVolume: BootableVolume) =>
  isBootableVolumePVCKind(bootableVolume)
    ? modelToGroupVersionKind(PersistentVolumeClaimModel)
    : DataSourceModelGroupVersionKind;

export const getBootableVolumePVCSource = (
  bootableVolume: BootableVolume,
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  },
): IoK8sApiCoreV1PersistentVolumeClaim | null => {
  if (isEmpty(bootableVolume)) return null;
  return isBootableVolumePVCKind(bootableVolume)
    ? bootableVolume
    : pvcSources?.[(bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.namespace]?.[
        (bootableVolume as V1beta1DataSource)?.spec?.source?.pvc?.name
      ];
};
