import { useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  generateVM,
  useIsWindowsBootableVolume,
} from '@catalog/CreateFromInstanceTypes/utils/utils';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@settings/tabs/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';

export type UseGeneratedVM = () => V1VirtualMachine;

const useGeneratedVM: UseGeneratedVM = () => {
  const cluster = useClusterParam();
  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const { subscriptionData } = useRHELAutomaticSubscription();
  const { instanceTypeVMState, runStrategy, vmNamespaceTarget } = useInstanceTypeVMStore();

  const namespace = useActiveNamespace();
  const [isUDNManagedNamespace] = useNamespaceUDN(getValidNamespace(namespace));
  const [hyperConverge] = useHyperConvergeConfiguration();
  const enableMultiArchBootImageImport =
    hyperConverge?.spec?.featureGates?.enableMultiArchBootImageImport;
  const generatedVM = useMemo(
    () =>
      generateVM({
        autoUpdateEnabled,
        cluster,
        enableMultiArchBootImageImport,
        instanceTypeState: instanceTypeVMState,
        isUDNManagedNamespace,
        runStrategy,
        subscriptionData,
        targetNamespace: vmNamespaceTarget,
      }),
    [
      autoUpdateEnabled,
      cluster,
      enableMultiArchBootImageImport,
      instanceTypeVMState,
      isUDNManagedNamespace,
      runStrategy,
      subscriptionData,
      vmNamespaceTarget,
    ],
  );

  const [driversImage] = useDriversImage();
  const isWindowsOSVolume = useIsWindowsBootableVolume();

  return useMemo(
    () => (isWindowsOSVolume ? addWinDriverVolume(generatedVM, driversImage) : generatedVM),
    [driversImage, generatedVM, isWindowsOSVolume],
  );
};

export default useGeneratedVM;
