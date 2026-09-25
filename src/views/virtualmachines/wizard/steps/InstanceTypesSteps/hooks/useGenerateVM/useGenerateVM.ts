import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_OS } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import useDeepCompareMemoize from '@kubevirt-utils/hooks/useDeepCompareMemoize/useDeepCompareMemoize';
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
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import {
  createPopulatedCloudInitYAML,
  generateVM as buildVM,
  isWindowBootableVolume,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { getSelectedPreferenceName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getSelectedPreference';
import { getVMGenerationSource } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getVMGenerationSource';

export type UseGenerateVMResult = {
  generateVM: () => V1VirtualMachine;
  generationSource: Readonly<Record<string, unknown>>;
  ready: boolean;
};

const useGenerateVM = (autoLabelsLoading: boolean): UseGenerateVMResult => {
  const { control } = useVMWizardForm();
  const [vmData, instanceTypeData] = useWatch({
    control,
    name: ['deployment', 'instanceType'],
  });

  const { cluster, name, project } = vmData;
  const { bootVolume, preference } = instanceTypeData;
  const selectedBootableVolume = bootVolume?.volume ?? null;

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
  const stableSubscriptionData = useDeepCompareMemoize(subscriptionData);

  const populatedCloudInitYAML = useMemo(
    () =>
      createPopulatedCloudInitYAML(
        selectedPreference,
        osLabel,
        stableSubscriptionData,
        autoUpdateEnabled,
      ),
    [autoUpdateEnabled, osLabel, selectedPreference, stableSubscriptionData],
  );

  const generatedVMName = useMemo(() => generatePrettyName(osLabel), [osLabel]);

  const vmName = name ?? generatedVMName;

  const [driversImage] = useDriversImage(cluster);
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);

  const defaultSSHSecretName =
    typeof authorizedSSHKeys?.[project] === 'string'
      ? (authorizedSSHKeys[project] as string)
      : undefined;

  const generateVM = useCallback(() => {
    const generatedVM = buildVM({
      context: {
        enableMultiArchBootImageImport,
        isIPv6SingleStack,
        isUDNManagedNamespace,
        populatedCloudInitYAML,
        sshSecretName: defaultSSHSecretName,
        vmCreationNad,
        vmName,
      },
      deployment: vmData,
      instanceType: instanceTypeData,
    });

    const isWindowsOSVolume = isWindowBootableVolume(selectedBootableVolume);

    return isWindowsOSVolume ? addWinDriverVolume(generatedVM, driversImage) : generatedVM;
  }, [
    defaultSSHSecretName,
    driversImage,
    enableMultiArchBootImageImport,
    instanceTypeData,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    populatedCloudInitYAML,
    selectedBootableVolume,
    vmCreationNad,
    vmData,
    vmName,
  ]);

  const generationSource = getVMGenerationSource({
    autoUpdateEnabled,
    context: {
      enableMultiArchBootImageImport,
      isIPv6SingleStack,
      isUDNManagedNamespace,
      sshSecretName: defaultSSHSecretName,
      vmCreationNad,
    },
    driversImage,
    instanceTypeData,
    subscriptionData,
    vmData,
  });

  return {
    generateVM,
    generationSource,
    ready: loaded && !autoLabelsLoading,
  };
};

export default useGenerateVM;
