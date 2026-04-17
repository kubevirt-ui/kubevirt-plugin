import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_PREFERENCE_LABEL,
  KUBEVIRT_OS,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import { getLabel } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { generatePrettyName, getValidNamespace } from '@kubevirt-utils/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import {
  createPopulatedCloudInitYAML,
  generateVM,
  useIsWindowsBootableVolume,
} from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/hooks/useGenerateVM/utils';

export type UseGenerateVM = () => V1VirtualMachine;

const useGenerateVM: UseGenerateVM = () => {
  const { cluster, folder, project: namespace } = useVMWizardStore();
  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const { subscriptionData } = useRHELAutomaticSubscription();
  const store = useInstanceTypeVMStore();
  const { customDiskSize, dvSource, pvcSource, selectedBootableVolume, selectedInstanceType } =
    store;

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

  const generatedVM = useMemo(
    () =>
      generateVM({
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
        targetNamespace: namespace,
      }),
    [
      cluster,
      customDiskSize,
      dvSource,
      enableMultiArchBootImageImport,
      folder,
      generatedVMName,
      isIPv6SingleStack,
      isUDNManagedNamespace,
      namespace,
      populatedCloudInitYAML,
      pvcSource,
      selectedBootableVolume,
      selectedInstanceType,
    ],
  );

  const [driversImage] = useDriversImage();
  const isWindowsOSVolume = useIsWindowsBootableVolume();

  return useMemo(
    () => (isWindowsOSVolume ? addWinDriverVolume(generatedVM, driversImage) : generatedVM),
    [driversImage, generatedVM, isWindowsOSVolume],
  );
};

export default useGenerateVM;
