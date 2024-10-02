import produce from 'immer';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  addDNFUpdateToRunCMD,
  addSubscriptionManagerToRunCMD,
  CloudInitUserData,
  convertUserDataObjectToYAML,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { sysprepDisk, sysprepVolume } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  isBootableVolumeISO,
  isBootableVolumePVCKind,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES, OS_NAME_TYPES_NOT_SUPPORTED } from '@kubevirt-utils/resources/template';
import {
  DEFAULT_NETWORK,
  DEFAULT_NETWORK_INTERFACE,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { generatePrettyName, getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sGroupVersionKind, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { AutomaticSubscriptionTypeEnum } from '../../../../views/clusteroverview/SettingsTab/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/components/AutomaticSubscriptionType/utils/utils';
import { useInstanceTypeVMStore } from '../state/useInstanceTypeVMStore';
import { InstanceTypeVMState } from '../state/utils/types';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
  KUBEVIRT_OS,
} from './constants';

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
  const { activationKey, organizationID, type } = subscriptionData;

  const cloudInitConfig: CloudInitUserData = {
    chpasswd: { expire: false },
    password: generateCloudInitPassword(),
    user: getCloudInitUserNameByOS(selectedPreference, osLabel),
  };

  const isRHELVM = selectedPreference.includes(OS_NAME_TYPES.rhel);

  if (
    isRHELVM &&
    !isEmpty(activationKey) &&
    !isEmpty(organizationID) &&
    type !== AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION
  ) {
    addSubscriptionManagerToRunCMD(cloudInitConfig, subscriptionData);
    addDNFUpdateToRunCMD(cloudInitConfig, autoUpdateEnabled);
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
  const {
    pvcSource,
    selectedBootableVolume,
    selectedInstanceType,
    sshSecretCredentials,
    sysprepConfigMapData,
    vmName,
  } = instanceTypeState;
  const { sshSecretName } = sshSecretCredentials;
  const virtualmachineName = vmName ?? generatePrettyName();

  const selectedPreference = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  const osLabel = getLabel(selectedBootableVolume, KUBEVIRT_OS);
  const selectPreferenceKind = getLabel(
    selectedBootableVolume,
    DEFAULT_PREFERENCE_KIND_LABEL,
    null,
  );
  const isDynamic = instanceTypeState?.isDynamicSSHInjection;
  const isSysprep = !isEmpty(sysprepConfigMapData?.name);
  const isIso = isBootableVolumeISO(selectedBootableVolume);
  const storageClassName =
    instanceTypeState.selectedStorageClass || pvcSource?.spec?.storageClassName;

  let emptyVM: V1VirtualMachine = {
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
            sourceRef: {
              kind: DataSourceModel.kind,
              name: getName(selectedBootableVolume),
              namespace: getNamespace(selectedBootableVolume),
            },
            storage: {
              resources: pvcSource
                ? {
                    requests: {
                      storage: pvcSource?.spec?.resources?.requests?.storage,
                    },
                  }
                : {},
              storageClassName,
            },
          },
        },
      ],
      instancetype: {
        ...(instanceTypeState?.selectedInstanceType?.namespace && {
          kind: VirtualMachineInstancetypeModel.kind,
        }),
        name:
          selectedInstanceType?.name ||
          selectedBootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        name: selectedPreference,
        ...(selectPreferenceKind && { kind: selectPreferenceKind }),
      },
      running: startVM,
      template: {
        metadata: {
          labels: {
            [HEADLESS_SERVICE_LABEL]: HEADLESS_SERVICE_NAME,
          },
        },
        spec: {
          domain: {
            devices: {
              autoattachPodInterface: false,
              disks: [],
              interfaces: [DEFAULT_NETWORK_INTERFACE],
            },
          },
          networks: [DEFAULT_NETWORK],
          subdomain: HEADLESS_SERVICE_NAME,
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

  if (isBootableVolumePVCKind(selectedBootableVolume)) {
    emptyVM = addPVCAsSourceDiskToVM(emptyVM, selectedBootableVolume);
  }
  if (isIso) {
    emptyVM = addISOFlowToVM(emptyVM, storageClassName);
  }

  if (isSysprep) {
    emptyVM = addSysprepOrCloudInitToVM(emptyVM, sysprepConfigMapData.name);
  }

  if (instanceTypeState.customDiskSize) {
    emptyVM = addSizeToROOTDISKVM(emptyVM, instanceTypeState.customDiskSize, isIso);
  }

  if (sshSecretName) {
    emptyVM = addSecretToVM(emptyVM, sshSecretName, isDynamic);
  }

  return emptyVM;
};

export const addISOFlowToVM = (vm: V1VirtualMachine, storageClassName: string) => {
  return produce(vm, (vmDraft) => {
    vmDraft.spec.dataVolumeTemplates.push({
      metadata: {
        name: `${vmDraft.metadata.name}-volume-blank`,
      },
      spec: {
        source: {
          blank: {},
        },
        storage: {
          resources: { requests: { storage: '30Gi' } },
          storageClassName,
        },
      },
    });

    const disks = vmDraft.spec.template.spec.domain.devices.disks;

    if (!disks) vmDraft.spec.template.spec.domain.devices.disks = [];

    vmDraft.spec.template.spec.domain.devices.disks = disks.concat([
      {
        bootOrder: 2,
        cdrom: {
          bus: InterfaceTypes.SATA,
        },
        name: `${vmDraft.metadata.name}-cdrom-iso`,
      },
      {
        bootOrder: 1,
        name: ROOTDISK,
      },
    ]);

    const volumes = vmDraft.spec.template.spec.volumes;
    const volumeRootDisk = volumes.find((volume) => volume.name === ROOTDISK);
    volumeRootDisk.name = `${vmDraft.metadata.name}-cdrom-iso`;

    vmDraft.spec.template.spec.volumes.push({
      dataVolume: { name: `${vmDraft.metadata.name}-volume-blank` },
      name: ROOTDISK,
    });
  });
};

export const addSizeToROOTDISKVM = (vm: V1VirtualMachine, storage: string, isIso: boolean) => {
  return produce(vm, (vmDraft) => {
    const dvName = `${vmDraft.metadata.name}-volume${isIso ? '-blank' : ''}`;

    const rootDisk = vmDraft.spec.dataVolumeTemplates.find((dv) => dv.metadata.name === dvName);
    rootDisk.spec.storage.resources = {
      requests: {
        storage,
      },
    };
  });
};

export const addSysprepOrCloudInitToVM = (vm: V1VirtualMachine, sysprepName: string) => {
  return produce(vm, (vmDraft) => {
    vmDraft.spec.template.spec.domain.devices.disks.push(sysprepDisk());
    const volumesWithoutCloudInit = vmDraft.spec.template.spec.volumes.filter(
      (volume) => volume.name !== 'cloudinitdisk',
    );
    vmDraft.spec.template.spec.volumes = volumesWithoutCloudInit.concat([
      sysprepVolume(sysprepName),
    ]);
  });
};

export const addPVCAsSourceDiskToVM = (
  vm: V1VirtualMachine,
  selectedBootableVolume: BootableVolume,
) => {
  return produce(vm, (vmDraft) => {
    const rootDiskIndex = vmDraft.spec.dataVolumeTemplates.findIndex(
      (dv) => dv.metadata.name === ROOTDISK,
    );
    const sourcePVC = {
      name: getName(selectedBootableVolume),
      namespace: getNamespace(selectedBootableVolume),
    };

    vmDraft.spec.dataVolumeTemplates[rootDiskIndex].spec = {
      source: {
        pvc: { ...sourcePVC },
      },
      ...vmDraft.spec.dataVolumeTemplates[rootDiskIndex].spec.storage,
    };
  });
};

export const groupVersionKindFromCommonResource = (
  resource: K8sResourceCommon,
): K8sGroupVersionKind => {
  const [group, version] = resource.apiVersion.split('/');
  const kind = resource.kind;
  return { group, kind, version };
};

export const useIsWindowsBootableVolume = (): boolean => {
  const { instanceTypeVMState } = useInstanceTypeVMStore();
  const { selectedBootableVolume } = instanceTypeVMState;
  const defaultPreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);

  return defaultPreferenceName?.startsWith(OS_WINDOWS_PREFIX);
};
