import { useState } from 'react';
import { useNavigate } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CUSTOMIZE_VM_FAILED,
  CUSTOMIZE_VM_SUCCEEDED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { clearCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { getErrorMessage, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getVMURL } from '@multicluster/urls';
import { useSignals } from '@preact/signals-react/runtime';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

type UseCreateCustomizedVM = () => {
  createCustomizedVM: () => Promise<void>;
  error: any | Error;
  isSubmitting: boolean;
};

const useCreateCustomizedVM: UseCreateCustomizedVM = () => {
  useSignals();
  const navigate = useNavigate();
  const cluster = useClusterParam();
  const { project: vmNamespaceTarget } = useVMWizardStore();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [isUDNManagedNamespace] = useNamespaceUDN(vmNamespaceTarget);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);

  const createCustomizedVM = async () => {
    setIsSubmitting(true);
    setError(null);
    const storeVM = vmSignal.value;
    if (!storeVM) {
      const e = new Error('Cannot create VM: customized VM payload is empty');
      setError(e);
      kubevirtConsole.error('Error: ', e.message);
      return;
    }

    try {
      if (isIPv6SingleStack) removePodNetworkFromVM(storeVM);

      const createdVM = await kubevirtK8sCreate({
        cluster,
        data: storeVM,
        model: VirtualMachineModel,
      });

      logITFlowEvent(CUSTOMIZE_VM_SUCCEEDED, createdVM);
      clearCustomizeInstanceType();

      if (!isUDNManagedNamespace) {
        try {
          await createHeadlessService(createdVM);
        } catch (svcErr) {
          kubevirtConsole.warn(t('Headless service creation failed: '), getErrorMessage(svcErr));
        }
      }

      navigate(getVMURL(cluster, vmNamespaceTarget, getName(createdVM)));
    } catch (err) {
      setError(err);
      kubevirtConsole.error('Error: ', getErrorMessage(err));
      logITFlowEvent(CUSTOMIZE_VM_FAILED, storeVM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createCustomizedVM,
    error,
    isSubmitting,
  };
};

export default useCreateCustomizedVM;
