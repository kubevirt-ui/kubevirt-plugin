import { type UseFormGetValues } from 'react-hook-form';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  addDNFUpdateToRunCMD,
  addSubscriptionManagerToRunCMD,
  type CloudInitUserData,
  convertUserDataObjectToYAML,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { addSecretToVM } from '@kubevirt-utils/components/SSHSecretModal/utils/utils';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { type RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getLabel, getLabels } from '@kubevirt-utils/resources/shared';
import { OS_NAME_TYPES, OS_NAME_TYPES_NOT_SUPPORTED } from '@kubevirt-utils/resources/template';
import { OS_WINDOWS_PREFIX } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { AutomaticSubscriptionTypeEnum } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/components/AutomaticSubscriptionType/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';
import { type GetMergedMetadataLabelsArgs } from '@virtualmachines/wizard/hooks/types/types';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

import { type GenerateVMCallback } from '../types';

import { getSpecConfiguration } from './generateVMSpecConfig';

export const generateVM: GenerateVMCallback = ({
  autoAppliedLabels,
  context,
  getValues,
  instanceTypeData,
  vmData,
}) => {
  const { cluster, description, folder, project } = vmData;
  const { selectedBootableVolume } = instanceTypeData;
  const { adminLabels, userDefaults } = autoAppliedLabels;

  const generatedVM: V1VirtualMachine = {
    apiVersion: `${VirtualMachineModel.apiGroup}/${VirtualMachineModel.apiVersion}`,
    kind: VirtualMachineModel.kind,
    ...(cluster && { cluster }),
    metadata: getMergedMetadataLabels({
      adminLabels,
      description,
      folder,
      getValues,
      project,
      userDefaults,
      vmName: context.vmName,
    }),
    spec: getSpecConfiguration({
      context,
      instanceTypeData,
    }),
  };

  if (context.sshSecretName) {
    const isDynamic = getLabel(selectedBootableVolume, DYNAMIC_CREDENTIALS_SUPPORT) === 'true';
    return addSecretToVM(generatedVM, context.sshSecretName, isDynamic);
  }

  return generatedVM;
};

export const isWindowBootableVolume = (selectedBootableVolume: BootableVolume | null): boolean => {
  const defaultPreferenceName = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  return defaultPreferenceName?.startsWith(OS_WINDOWS_PREFIX) ?? false;
};

export const generateCloudInitPassword = (): string =>
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
): string => {
  const { activationKey, organizationID, type } = subscriptionData;

  const cloudInitConfig: CloudInitUserData = {
    chpasswd: { expire: false },
    password: generateCloudInitPassword(),
    user: getCloudInitUserNameByOS(selectedPreference, osLabel),
  };

  const isRHELVM = selectedPreference?.includes(OS_NAME_TYPES.Rhel);
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

export const getAdminLabelsToMerge = (
  adminLabels: AutoAppliedLabel[],
  userDefaults: Record<string, string>,
  getValues: UseFormGetValues<VMWizardFormValues>,
) => {
  const customizedVM = getValues(CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM);
  const existingLabels = customizedVM ? getLabels(customizedVM, {}) : {};
  const adminLabelsToMerge = adminLabels?.reduce<Record<string, string>>((acc, { key, value }) => {
    if (existingLabels[key]) {
      return acc;
    }
    acc[key] = isEmpty(value) ? userDefaults?.[key] : (value ?? '');
    return acc;
  }, {});

  return { ...adminLabelsToMerge, ...existingLabels };
};
export const getMergedMetadataLabels = ({
  adminLabels,
  description,
  folder,
  getValues,
  project,
  userDefaults,
  vmName,
}: GetMergedMetadataLabelsArgs) => {
  const adminLabelsToMerge = getAdminLabelsToMerge(adminLabels, userDefaults, getValues);

  const metadataLabels = {
    labels: {
      ...(folder && { [VM_FOLDER_LABEL]: folder }),
      ...(adminLabelsToMerge ?? {}),
    },
  };

  const metadata = {
    ...(description && { annotations: { description } }),
    name: vmName,
    namespace: project,
  };

  return { ...metadata, ...metadataLabels };
};
