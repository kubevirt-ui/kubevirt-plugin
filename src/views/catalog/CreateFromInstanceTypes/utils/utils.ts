/* eslint-disable perfectionist/sort-objects */
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { convertUserDataObjectToYAML } from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { ACTIVATION_KEY } from '@kubevirt-utils/components/CloudinitModal/utils/consts';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';

import { InstanceTypeVMState } from '../state/utils/types';

import { DEFAULT_INSTANCETYPE_LABEL, DEFAULT_PREFERENCE_LABEL } from './constants';

const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

const getCloudInitUserNameByOS = (selectedPreferenceName: string): string => {
  const [osPrefix] = selectedPreferenceName.split('.');
  if (osPrefix.startsWith(OS_NAME_TYPES.rhel)) return 'cloud-user';
  if (osPrefix.startsWith(OS_NAME_TYPES.centos)) return 'centos';
  return 'fedora';
};

export const createPopulatedCloudInitYAML = (
  selectedPreference: string,
  subscriptionData: RHELAutomaticSubscriptionData,
) => {
  const { activationKey, organizationID } = subscriptionData;
  return convertUserDataObjectToYAML(
    {
      user: getCloudInitUserNameByOS(selectedPreference),
      password: generateCloudInitPassword(),
      chpasswd: { expire: false },
      ...(selectedPreference.includes(OS_NAME_TYPES.rhel) &&
        !isEmpty(activationKey) &&
        !isEmpty(organizationID) && {
          rh_subscription: { [ACTIVATION_KEY]: activationKey, org: organizationID },
        }),
    },
    true,
  );
};

export const generateVM = (
  instanceTypeState: InstanceTypeVMState,
  targetNamespace: string,
  startVM: boolean,
  subscriptionData: RHELAutomaticSubscriptionData,
) => {
  const { pvcSource, selectedBootableVolume, selectedInstanceType, sshSecretCredentials, vmName } =
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

  const selectedPreference = selectedBootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  const isDynamic = instanceTypeState?.isDynamicSSHInjection;

  const emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: virtualmachineName,
      namespace: targetNamespace,
    },
    spec: {
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
              resources: { requests: { storage: pvcSource?.spec?.resources?.requests?.storage } },
              storageClassName: pvcSource?.spec?.storageClassName,
            },
          },
        },
      ],
      instancetype: {
        name:
          selectedInstanceType ||
          selectedBootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        name: selectedPreference,
      },
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
              cloudInitConfigDrive: {
                userData: createPopulatedCloudInitYAML(selectedPreference, subscriptionData),
              },
              name: 'cloudinitdisk',
            },
          ],
        },
      },
    },
  };

  return sshSecretName ? addSecretToVM(emptyVM, sshSecretName, isDynamic) : emptyVM;
};
