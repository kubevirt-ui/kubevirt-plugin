import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { getErrorMessage, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getVMURL } from '@multicluster/urls';
import { useSignals } from '@preact/signals-react/runtime';

import { useVMWizard } from '../state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '../state/vm-wizard-form/consts';

import {
  createHeadlessServiceSafely,
  logFailedVMCreation,
  logSuccessfulVMCreation,
  prepareVMToCreate,
} from './utils/utils';

type UseCreateCustomizedVM = () => {
  createCustomizedVM: () => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCreateCustomizedVM: UseCreateCustomizedVM = () => {
  useSignals();
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const cluster = useClusterParam();
  const { control, getValues } = useVMWizard();
  const vmNamespaceTarget = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT });
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [isUDNManagedNamespace] = useNamespaceUDN(vmNamespaceTarget);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const createCustomizedVM = async () => {
    const {
      creationMethod,
      name: vmName,
      selectedTemplate,
    } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);
    const storeVM = customizeWizardVMSignal.value;

    if (!storeVM) {
      const emptyPayloadError = new Error(t('Cannot create VM: customized VM payload is empty'));
      setError(emptyPayloadError);
      kubevirtConsole.error('Error: ', emptyPayloadError?.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const vmToCreate = prepareVMToCreate(storeVM, vmName, isIPv6SingleStack);

      const createdVM = await kubevirtK8sCreate({
        cluster,
        data: vmToCreate,
        model: VirtualMachineModel,
      });

      logSuccessfulVMCreation(createdVM, creationMethod, selectedTemplate);

      if (!isUDNManagedNamespace) {
        await createHeadlessServiceSafely(createdVM, t);
      }

      navigate(getVMURL(cluster, vmNamespaceTarget, getName(createdVM)));
    } catch (err) {
      setError(err);
      kubevirtConsole.error('Error: ', getErrorMessage(err));
      logFailedVMCreation(storeVM, creationMethod, err);
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
