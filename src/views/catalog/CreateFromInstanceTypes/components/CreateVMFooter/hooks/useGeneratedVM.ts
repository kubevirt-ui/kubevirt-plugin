import { useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  generateVM,
  useIsWindowsBootableVolume,
} from '@catalog/CreateFromInstanceTypes/utils/utils';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { AUTOMATIC_UPDATE_FEATURE_NAME } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import useRHELAutomaticSubscription from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/useRHELAutomaticSubscription';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { addWinDriverVolume } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { useDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/useDriversImage';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

export type UseGeneratedVMType = () => V1VirtualMachine;

const useGeneratedVM = () => {
  const { featureEnabled: autoUpdateEnabled } = useFeatureReadOnly(AUTOMATIC_UPDATE_FEATURE_NAME);

  const { subscriptionData } = useRHELAutomaticSubscription();
  const { instanceTypeVMState, startVM, vmNamespaceTarget } = useInstanceTypeVMStore();

  const [activeNamespace] = useActiveNamespace();
  const [isUDNManagedNamespace] = useNamespaceUDN(
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : activeNamespace,
  );

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
