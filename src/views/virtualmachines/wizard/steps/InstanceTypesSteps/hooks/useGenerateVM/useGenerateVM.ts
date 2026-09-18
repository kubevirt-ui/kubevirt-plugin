import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_OS } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import useProjectDefaultNad from '@kubevirt-utils/resources/namespace/hooks/useProjectDefaultNad';
import { getLabel } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { generatePrettyName, getValidNamespace } from '@kubevirt-utils/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';
import useApplyAutoLabels from '@virtualmachines/wizard/hooks/useApplyAutoLabels';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import {
  createPopulatedCloudInitYAML,
  generateVM,
  isWindowBootableVolume,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { getSelectedPreferenceName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getSelectedPreference';

export type UseGenerateVMResult = {
  adminLabels: AutoAppliedLabel[];
  generatedVM: undefined | V1VirtualMachine;
  loaded: boolean;
  userDefaults: Record<string, string>;
};

const useGenerateVM = (): UseGenerateVMResult => {
  const { control, getValues } = useVMWizard();
  const [vmData, instanceTypeData] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.ROOT, CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.ROOT],
  });

  const { cluster, name, project } = vmData;
  const { preference, selectedBootableVolume } = instanceTypeData;

  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);
  const { subscriptionData } = useRHELAutomaticSubscription();

  const validNamespace = getValidNamespace(project);
  const [isUDNManagedNamespace] = useNamespaceUDN(validNamespace, cluster);
  const { loaded, vmCreationNad } = useProjectDefaultNad({
    cluster,
    namespaceName: validNamespace,
  });
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [hyperConverge] = useHyperConvergeConfiguration();
  const enableMultiArchBootImageImport =
    hyperConverge?.spec?.featureGates?.enableMultiArchBootImageImport;

  const selectedPreference = getSelectedPreferenceName(selectedBootableVolume, preference);
  const osLabel = getLabel(selectedBootableVolume, KUBEVIRT_OS) ?? preference?.name;
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

  const { adminLabels, isLoading: autoLabelsLoading, userDefaults } = useApplyAutoLabels(cluster);

  const [driversImage] = useDriversImage(cluster);
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);
  const defaultSSHSecretName =
    typeof authorizedSSHKeys?.[project] === 'string'
      ? (authorizedSSHKeys[project] as string)
      : undefined;

  const generatedVM = useMemo(() => {
    if (autoLabelsLoading) {
      return;
    }

    return generateVM({
      autoAppliedLabels: { adminLabels, userDefaults },
      context: {
        enableMultiArchBootImageImport,
        isIPv6SingleStack,
        isUDNManagedNamespace,
        populatedCloudInitYAML,
        sshSecretName: defaultSSHSecretName,
        vmCreationNad,
        vmName: name ?? generatedVMName,
      },
      getValues,
      instanceTypeData,
      vmData,
    });
  }, [
    adminLabels,
    autoLabelsLoading,
    defaultSSHSecretName,
    enableMultiArchBootImageImport,
    generatedVMName,
    instanceTypeData,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    name,
    populatedCloudInitYAML,
    userDefaults,
    vmCreationNad,
    vmData,
    getValues,
  ]);

  const vmWithDrivers = useMemo(() => {
    if (!generatedVM) {
      return;
    }

    const isWindowsOSVolume = isWindowBootableVolume(selectedBootableVolume);
    return isWindowsOSVolume ? addWinDriverVolume(generatedVM, driversImage) : generatedVM;
  }, [driversImage, generatedVM, selectedBootableVolume]);

  return {
    adminLabels,
    generatedVM: vmWithDrivers,
    loaded: loaded && !autoLabelsLoading,
    userDefaults,
  };
};

export default useGenerateVM;
