import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  addCloudInitUpdateCMD,
  CloudInitUserData,
  convertUserDataObjectToYAML,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { ACTIVATION_KEY } from '@kubevirt-utils/components/CloudinitModal/utils/constants';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretSection/utils/utils';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { isBootableVolumePVCKind } from '@kubevirt-utils/resources/bootableresources/helpers';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES, OS_NAME_TYPES_NOT_SUPPORTED } from '@kubevirt-utils/resources/template';
import { generatePrettyName, getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { InstanceTypeVMState } from '../state/utils/types';

import { DEFAULT_INSTANCETYPE_LABEL, DEFAULT_PREFERENCE_LABEL, KUBEVIRT_OS } from './constants';

const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

const getCloudInitUserNameByOS = (selectedPreferenceName: string, osLabel: string): string => {
  for (const name in [
    ...Object.values(OS_NAME_TYPES),
    ...Object.values(OS_NAME_TYPES_NOT_SUPPORTED),
  ]) {
    if (selectedPreferenceName?.includes(name) || osLabel?.includes(name)) return name;
  }
  return 'cloud-user';
};

export const createPopulatedCloudInitYAML = (
  selectedPreference: string,
  osLabel: string,
  subscriptionData: RHELAutomaticSubscriptionData,
  autoUpdateEnabled?: boolean,
) => {
  const { activationKey, organizationID } = subscriptionData;

  const cloudInitConfig: CloudInitUserData = {
    chpasswd: { expire: false },
    password: generateCloudInitPassword(),
    user: getCloudInitUserNameByOS(selectedPreference, osLabel),
  };

  const isRHELVM = selectedPreference.includes(OS_NAME_TYPES.rhel);

  if (isRHELVM && !isEmpty(activationKey) && !isEmpty(organizationID)) {
    cloudInitConfig.rh_subscription = { [ACTIVATION_KEY]: activationKey, org: organizationID };

    if (autoUpdateEnabled) {
      addCloudInitUpdateCMD(cloudInitConfig);
    }
  }

  return convertUserDataObjectToYAML(cloudInitConfig, true);
};

export const generateVM = (
  instanceTypeState: InstanceTypeVMState,
  targetNamespace: string,
  startVM: boolean,
  subscriptionData: RHELAutomaticSubscriptionData,
  autoUpdateEnabled?: boolean,
) => {
  const { pvcSource, selectedBootableVolume, selectedInstanceType, sshSecretCredentials, vmName } =
    instanceTypeState;
  const { sshSecretName } = sshSecretCredentials;
  const virtualmachineName = vmName ?? generatePrettyName();

  const sourcePVC = {
    name: getName(selectedBootableVolume),
    namespace: getNamespace(selectedBootableVolume),
  };

  const selectedPreference = selectedBootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL];
  const osLabel = getLabel(selectedBootableVolume, KUBEVIRT_OS);
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
              storageClassName:
                instanceTypeState.selectedStorageClass || pvcSource?.spec?.storageClassName,
            },
          },
        },
      ],
      instancetype: {
        kind: instanceTypeState?.selectedInstanceType?.namespace
          ? VirtualMachineInstancetypeModel.kind
          : VirtualMachineClusterInstancetypeModelGroupVersionKind?.kind,
        name:
          selectedInstanceType?.name ||
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
              interfaces: [{ masquerade: {}, name: 'default' }],
            },
          },
          networks: [{ name: 'default', pod: {} }],
          volumes: [
            {
              dataVolume: { name: `${virtualmachineName}-volume` },
              name: ROOTDISK,
            },
            {
              cloudInitNoCloud: {
                userData: createPopulatedCloudInitYAML(
                  selectedPreference,
                  osLabel,
                  subscriptionData,
                  autoUpdateEnabled,
                ),
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

export const groupVersionKindFromCommonResource = (
  resource: K8sResourceCommon,
): K8sGroupVersionKind => {
  const [group, version] = resource.apiVersion.split('/');
  const kind = resource.kind;
  return { group, kind, version };
};
