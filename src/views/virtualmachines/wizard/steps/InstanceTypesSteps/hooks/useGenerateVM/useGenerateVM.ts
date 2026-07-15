import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_PREFERENCE_LABEL,
  KUBEVIRT_OS,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { getLabel } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { generatePrettyName, getValidNamespace } from '@kubevirt-utils/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import {
  generateVM,
  isWindowBootableVolume,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { createPopulatedCloudInitYAML } from './utils/generateVM';

export type UseGenerateVM = () => V1VirtualMachine;

const useGenerateVM: UseGenerateVM = () => {
  const { control } = useVMWizard();
  const [
    cluster,
    namespace,
    selectedBootableVolume,
    vmDescription,
    folder,
    vmName,
    customDiskSize,
    dvSource,
    pvcSource,
    selectedInstanceType,
  ] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_BOOTABLE_VOLUME,
      CREATE_VM_FORM_FIELDS_VM_DATA.DESCRIPTION,
      CREATE_VM_FORM_FIELDS_VM_DATA.FOLDER,
      CREATE_VM_FORM_FIELDS_VM_DATA.NAME,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.CUSTOM_DISK_SIZE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.DV_SOURCE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PVC_SOURCE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE,
    ],
  });
  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const { subscriptionData } = useRHELAutomaticSubscription();

  const [isUDNManagedNamespace] = useNamespaceUDN(getValidNamespace(namespace));
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [hyperConverge] = useHyperConvergeConfiguration();
  const enableMultiArchBootImageImport =
    hyperConverge?.spec?.featureGates?.enableMultiArchBootImageImport;

  const selectedPreference = getLabel(selectedBootableVolume, DEFAULT_PREFERENCE_LABEL);
  const osLabel = getLabel(selectedBootableVolume, KUBEVIRT_OS);
  const populatedCloudInitYAML = useMemo(
    () =>
      createPopulatedCloudInitYAML(
        selectedPreference,
        osLabel,
        subscriptionData,
        autoUpdateEnabled,
      ),
    [selectedPreference, osLabel, subscriptionData, autoUpdateEnabled],
  );
  const generatedVMName = useMemo(() => generatePrettyName(osLabel), [osLabel]);

  const [driversImage] = useDriversImage();
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);
  const defaultSSHSecretName = authorizedSSHKeys?.[namespace];

  const generatedVM = useMemo(() => {
    return generateVM({
      cluster,
      customDiskSize,
      dvSource,
      enableMultiArchBootImageImport,
      folder,
      isIPv6SingleStack,
      isUDNManagedNamespace,
      populatedCloudInitYAML,
      pvcSource,
      selectedBootableVolume,
      selectedInstanceType,
      sshSecretName: defaultSSHSecretName,
      targetNamespace: namespace,
      vmDescription,
      vmName: vmName || generatedVMName,
    });
  }, [
    cluster,
    customDiskSize,
    defaultSSHSecretName,
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
    namespace,
    vmDescription,
    vmName,
  ]);

  return useMemo(() => {
    const isWindowsOSVolume = isWindowBootableVolume(selectedBootableVolume);
    return isWindowsOSVolume ? addWinDriverVolume(generatedVM, driversImage) : generatedVM;
  }, [driversImage, generatedVM, selectedBootableVolume]);
};

export default useGenerateVM;
