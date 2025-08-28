import { useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  generateVM,
  useIsWindowsBootableVolume,
} from '@catalog/CreateFromInstanceTypes/utils/utils';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@overview/SettingsTab/ClusterTab/components/GuestManagmentSection/AutomaticSubscriptionRHELGuests/utils/constants';

export type UseGeneratedVMType = () => V1VirtualMachine;

const useGeneratedVM = () => {
  const { featureEnabled: autoUpdateEnabled } = useFeatures(AUTOMATIC_UPDATE_FEATURE_NAME);

  const { subscriptionData } = useRHELAutomaticSubscription();
  const { instanceTypeVMState, startVM, vmNamespaceTarget } = useInstanceTypeVMStore();

  const namespace = useNamespaceParam();
  const [isUDNManagedNamespace] = useNamespaceUDN(getValidNamespace(namespace));

  const generatedVM = useMemo(
    () =>
      generateVM({
        autoUpdateEnabled,
        instanceTypeState: instanceTypeVMState,
        isUDNManagedNamespace,
        startVM,
        subscriptionData,
        targetNamespace: vmNamespaceTarget,
      }),
    [
      autoUpdateEnabled,
      instanceTypeVMState,
      isUDNManagedNamespace,
      startVM,
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
