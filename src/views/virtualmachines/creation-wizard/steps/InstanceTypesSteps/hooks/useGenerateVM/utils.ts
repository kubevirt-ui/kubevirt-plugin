import produce from 'immer';

import {
  DataSourceModel,
  VirtualMachineInstancetypeModel,
  VirtualMachineModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1Interface, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  addDNFUpdateToRunCMD,
  addSubscriptionManagerToRunCMD,
  CloudInitUserData,
  convertUserDataObjectToYAML,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { sysprepDisk, sysprepVolume } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { CLOUDINITDISK, ROOTDISK } from '@kubevirt-utils/constants/constants';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_KIND_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import {
  isBootableVolumeISO,
  isBootableVolumePVCKind,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import {
  getDataVolumeSize,
  getPVCSize,
  getPVCStorageClassName,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getLabels, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES, OS_NAME_TYPES_NOT_SUPPORTED } from '@kubevirt-utils/resources/template';
import {
  DEFAULT_NETWORK,
  DEFAULT_NETWORK_INTERFACE,
  getDefaultRunningStrategy,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { AutomaticSubscriptionTypeEnum } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/components/AutomaticSubscriptionType/utils/utils';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import { GenerateVMCallback } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

const getCloudInitUserNameByOS = (selectedPreferenceName: string, osLabel: string): string => {
  for (const name of [
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

  const isRHELVM = selectedPreference?.includes(OS_NAME_TYPES.rhel);

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

export const addRootDiskToVM = (vm: V1VirtualMachine) => {
  return produce(vm, (vmDraft) => {
    const disks = vmDraft.spec.template.spec.domain.devices.disks ?? [];
    vmDraft.spec.template.spec.domain.devices.disks = disks;

    if (isEmpty(disks)) {
      vmDraft.spec.template.spec.domain.devices.disks.push({
        bootOrder: 1,
        name: ROOTDISK,
      });
    }
  });
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

    if (!vmDraft.spec.template.spec.domain.devices.disks) {
      vmDraft.spec.template.spec.domain.devices.disks = [];
    }

    vmDraft.spec.template.spec.domain.devices.disks =
      vmDraft.spec.template.spec.domain.devices.disks.concat([
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
    if (volumeRootDisk) volumeRootDisk.name = `${vmDraft.metadata.name}-cdrom-iso`;

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
    if (rootDisk) {
      rootDisk.spec.storage.resources = {
        requests: {
          storage,
        },
      };
    }
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

    if (rootDiskIndex === -1) return;

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

export const useIsWindowsBootableVolume = (): boolean => {
  const { selectedBootableVolume } = useInstanceTypeVMStore();
  const defaultPreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);

  return defaultPreferenceName?.startsWith(OS_WINDOWS_PREFIX);
};

export const generateVM: GenerateVMCallback = ({
  cluster,
  customDiskSize,
  dvSource,
  enableMultiArchBootImageImport,
  folder,
  generatedVMName,
  isIPv6SingleStack,
  isUDNManagedNamespace,
  populatedCloudInitYAML,
  pvcSource,
  selectedBootableVolume,
  selectedInstanceType,
  targetNamespace,
}) => {
  const selectedPreference = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  const selectPreferenceKind = getLabel(
    selectedBootableVolume,
    DEFAULT_PREFERENCE_KIND_LABEL,
    null,
  );

  const isIso = isBootableVolumeISO(selectedBootableVolume);
  const isWindowsVM = selectedPreference?.startsWith(OS_WINDOWS_PREFIX);
  const storageClassName = getPVCStorageClassName(pvcSource);

  const defaultInterface = isUDNManagedNamespace
    ? ({ binding: { name: UDN_BINDING_NAME }, name: DEFAULT_NETWORK_INTERFACE.name } as V1Interface)
    : DEFAULT_NETWORK_INTERFACE;

  const volumeArchitecture = getArchitecture(selectedBootableVolume);

  let emptyVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    metadata: {
      name: generatedVMName,
      namespace: targetNamespace,
      ...(folder && { labels: { [VM_FOLDER_LABEL]: folder } }),
    },
    spec: {
      dataVolumeTemplates: [
        {
          metadata: {
            name: `${generatedVMName}-volume`,
          },
          spec: {
            sourceRef: {
              kind: DataSourceModel.kind,
              name: getName(selectedBootableVolume),
              namespace: getNamespace(selectedBootableVolume),
            },
            storage: {
              resources:
                dvSource || pvcSource
                  ? {
                      requests: {
                        storage: getDataVolumeSize(dvSource) || getPVCSize(pvcSource),
                      },
                    }
                  : {
                      requests: {
                        storage: DEFAULT_DISK_SIZE,
                      },
                    },
              storageClassName,
            },
          },
        },
      ],
      instancetype: {
        ...(selectedInstanceType?.namespace && {
          kind: VirtualMachineInstancetypeModel.kind,
        }),
        name:
          selectedInstanceType?.name ||
          getLabels(selectedBootableVolume)?.[DEFAULT_INSTANCETYPE_LABEL],
      },
      preference: {
        name: selectedPreference,
        ...(selectPreferenceKind && { kind: selectPreferenceKind }),
      },
      runStrategy: getDefaultRunningStrategy(),
      template: {
        metadata: {
          labels: {},
        },
        spec: {
          ...(!isEmpty(volumeArchitecture) &&
            enableMultiArchBootImageImport && {
              architecture: volumeArchitecture,
            }),
          domain: {
            devices: {
              autoattachPodInterface: false,
              disks: [],
              interfaces: isIPv6SingleStack ? [] : [defaultInterface],
            },
          },
          networks: isIPv6SingleStack ? [] : [DEFAULT_NETWORK],
          subdomain: HEADLESS_SERVICE_NAME,
          volumes: [
            {
              dataVolume: { name: `${generatedVMName}-volume` },
              name: ROOTDISK,
            },
            ...(!isWindowsVM
              ? [
                  {
                    cloudInitNoCloud: {
                      userData: populatedCloudInitYAML,
                    },
                    name: CLOUDINITDISK,
                  },
                ]
              : []),
          ],
        },
      },
    },
  };

  if (cluster) emptyVM.cluster = cluster;

  if (!isUDNManagedNamespace) {
    emptyVM.spec.template.metadata.labels[HEADLESS_SERVICE_LABEL] = HEADLESS_SERVICE_NAME;
  }

  if (isBootableVolumePVCKind(selectedBootableVolume)) {
    emptyVM = addPVCAsSourceDiskToVM(emptyVM, selectedBootableVolume);
  }

  if (isIso) {
    emptyVM = addISOFlowToVM(emptyVM, storageClassName);
  }

  if (customDiskSize) {
    emptyVM = addSizeToROOTDISKVM(emptyVM, customDiskSize, isIso);
  }

  emptyVM = addRootDiskToVM(emptyVM);

  return emptyVM;
};
