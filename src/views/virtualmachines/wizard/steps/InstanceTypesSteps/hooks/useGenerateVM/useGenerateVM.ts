import { useCallback, useState } from 'react';
import { useWatch } from 'react-hook-form';
import isEqual from 'lodash/isEqual';

import { KUBEVIRT_OS } from '@kubevirt-utils/constants/instancetypes-and-preferences';
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
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  type GenerateVM,
  type VMGenerationSource,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/types';
import {
  generateVM,
  isWindowBootableVolume,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/generateVM';
import { getSelectedPreferenceName } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils/getSelectedPreference';
import { useStableVMGenerationDefaults } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/useStableVMGenerationDefaults';
import { useVMGenerationSource } from '@virtualmachines/wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/useVMGenerationSource';
import { publishGeneratedVMDraft } from '@virtualmachines/wizard/utils/generatedVMDraft';

const useGenerateVM = (): GenerateVM => {
  const { control } = useVMWizard();
  const [vmData, instanceTypeData] = useWatch({
    control,
    name: ['vmData', 'instanceTypeData'],
  });

  const { cluster, name, project } = vmData;
  const { preference, selectedBootableVolume } = instanceTypeData;
  const [lastGenerationSource, setLastGenerationSource] = useState<VMGenerationSource>();

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
  const getStableGenerationDefaults = useStableVMGenerationDefaults({
    autoUpdateEnabled,
    name,
    osLabel,
    selectedPreference,
    subscriptionData,
  });
  const [driversImage] = useDriversImage(cluster);
  const [authorizedSSHKeys] = useKubevirtUserSettings(USER_SETTINGS_KEYS.ssh, cluster);
  const configuredSSHKey = authorizedSSHKeys?.[project];
  const defaultSSHSecretName = typeof configuredSSHKey === 'string' ? configuredSSHKey : undefined;

  const generationSource = useVMGenerationSource({
    autoUpdateEnabled,
    cluster,
    defaultSSHSecretName,
    driversImage,
    enableMultiArchBootImageImport,
    instanceTypeData,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    name,
    project,
    subscriptionData,
    vmCreationNad,
  });
  const existingGeneratedVMCanBeUsed =
    Boolean(customizeWizardVMSignal.value) && isEqual(lastGenerationSource, generationSource);

  const ensureGeneratedVM = useCallback((): boolean => {
    const hasExistingVM = Boolean(customizeWizardVMSignal.value);
    const generationSourceIsUnchanged = Boolean(isEqual(lastGenerationSource, generationSource));

    if (hasExistingVM && generationSourceIsUnchanged) {
      return true;
    }

    if (!loaded) {
      return false;
    }

    const { populatedCloudInitYAML, vmName } = getStableGenerationDefaults();
    const generatedVM = generateVM({
      context: {
        enableMultiArchBootImageImport,
        isIPv6SingleStack,
        isUDNManagedNamespace,
        populatedCloudInitYAML,
        sshSecretName: defaultSSHSecretName,
        vmCreationNad,
        vmName,
      },
      instanceTypeData,
      vmData,
    });
    const isWindowsOSVolume = isWindowBootableVolume(selectedBootableVolume);
    const generatedVMWithDrivers = isWindowsOSVolume
      ? addWinDriverVolume(generatedVM, driversImage)
      : generatedVM;

    publishGeneratedVMDraft(generatedVMWithDrivers);
    setLastGenerationSource(generationSource);

    return true;
  }, [
    defaultSSHSecretName,
    driversImage,
    enableMultiArchBootImageImport,
    generationSource,
    getStableGenerationDefaults,
    instanceTypeData,
    isIPv6SingleStack,
    isUDNManagedNamespace,
    lastGenerationSource,
    loaded,
    selectedBootableVolume,
    vmCreationNad,
    vmData,
  ]);

  return { ensureGeneratedVM, ready: existingGeneratedVMCanBeUsed || loaded };
};

export default useGenerateVM;
