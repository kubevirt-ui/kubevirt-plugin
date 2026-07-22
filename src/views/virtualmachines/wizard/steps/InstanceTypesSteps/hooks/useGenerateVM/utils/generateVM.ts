import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import {
  addDNFUpdateToRunCMD,
  addSubscriptionManagerToRunCMD,
  CloudInitUserData,
  convertUserDataObjectToYAML,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { OS_NAME_TYPES, OS_NAME_TYPES_NOT_SUPPORTED } from '@kubevirt-utils/resources/template';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { AutomaticSubscriptionTypeEnum } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/components/AutomaticSubscriptionType/utils/utils';
import { GenerateVMCallback } from '../types';
import { getSpecConfiguration } from './generateVMSpecConfig';

export const generateVM: GenerateVMCallback = ({
  cluster,
  customDiskSize,
  dvSource,
  enableMultiArchBootImageImport,
  folder,
  isIPv6SingleStack,
  isUDNManagedNamespace,
  populatedCloudInitYAML,
  vmCreationNad,
  pvcSource,
  selectedBootableVolume,
  selectedInstanceType,
  targetNamespace,
  vmDescription,
  vmName,
}) => {
  const generatedVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    ...(cluster && { cluster }),
    metadata: {
      ...(vmDescription && { annotations: { description: vmDescription } }),
      name: vmName,
      namespace: targetNamespace,
      ...(folder && { labels: { [VM_FOLDER_LABEL]: folder } }),
    },
    spec: getSpecConfiguration({
      selectedBootableVolume,
      dvSource,
      pvcSource,
      customDiskSize,
      vmName,
      selectedInstanceType,
      enableMultiArchBootImageImport,
      isIPv6SingleStack,
      populatedCloudInitYAML,
      isUDNManagedNamespace,
      vmCreationNad,
    }),
  };

  return generatedVM;
};

export const isWindowBootableVolume = (selectedBootableVolume: BootableVolume | null) => {
  const defaultPreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  return defaultPreferenceName?.startsWith(OS_WINDOWS_PREFIX);
};

export const generateCloudInitPassword = () =>
  `${getRandomChars(4)}-${getRandomChars(4)}-${getRandomChars(4)}`;

const getCloudInitUserNameByOS = (selectedPreferenceName: string, osLabel: string): string => {
  const allNames = [...Object.values(OS_NAME_TYPES), ...Object.values(OS_NAME_TYPES_NOT_SUPPORTED)];
  const userNameBySelectedPreferenceOrOSLabel = allNames.find(
    (name) => selectedPreferenceName?.includes(name) || osLabel?.includes(name),
  );
  return userNameBySelectedPreferenceOrOSLabel ?? 'cloud-user';
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
  const hasValidSubscription =
    isRHELVM &&
    !isEmpty(activationKey) &&
    !isEmpty(organizationID) &&
    type !== AutomaticSubscriptionTypeEnum.NO_SUBSCRIPTION;

  if (hasValidSubscription) {
    addSubscriptionManagerToRunCMD(cloudInitConfig, subscriptionData);
    addDNFUpdateToRunCMD(cloudInitConfig, autoUpdateEnabled);
  }

  return convertUserDataObjectToYAML(cloudInitConfig, true);
};
