import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { getName } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { getErrorMessage, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getVMURL, isACMPath } from '@multicluster/urls';
import { useK8sModels } from '@openshift-console/dynamic-plugin-sdk';
import { mapWizardValuesToFinalVM } from '@virtualmachines/wizard/form/mapWizardValuesToFinalVM';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import { SELECTED_CLUSTER } from '../utils/constants';
import { isTemplateCreationMethod } from '../utils/utils';
import { createTemplateAdditionalObjects } from './utils/templateAdditionalObjects';
import {
  createHeadlessServiceSafely,
  logFailedVMCreation,
  logSuccessfulVMCreation,
} from './utils/utils';

type UseCreateCustomizedVM = () => {
  createCustomizedVM: (values: VMWizardFormValues) => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCreateCustomizedVM: UseCreateCustomizedVM = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { control } = useVMWizardForm();
  const [cluster, vmNamespaceTarget] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project'],
  });
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [isUDNManagedNamespace] = useNamespaceUDN(vmNamespaceTarget, cluster);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [models] = useK8sModels();
  const [_clusterFromLocalStorage, setClusterInLocalStorage] = useLocalStorage(
    SELECTED_CLUSTER.LOCAL_STORAGE_KEY,
  );

  const createCustomizedVM = async (values: VMWizardFormValues): Promise<void> => {
    const { creationMethod, customization, deployment, template } = values;
    const storeVM = mapWizardValuesToFinalVM(values, { isIPv6SingleStack });

    if (!storeVM) {
      const emptyPayloadError = new Error(t('Cannot create VM: customized VM payload is empty'));
      setError(emptyPayloadError);
      kubevirtConsole.error('Error: ', emptyPayloadError.message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdVM = await kubevirtK8sCreate({
        cluster: deployment.cluster,
        data: storeVM,
        model: VirtualMachineModel,
      });

      logSuccessfulVMCreation(createdVM, creationMethod, template.selectedTemplate);

      if (
        isTemplateCreationMethod(creationMethod) &&
        customization.templateAdditionalObjects.length > 0
      ) {
        await createTemplateAdditionalObjects(
          customization.templateAdditionalObjects,
          createdVM,
          models,
          t,
        );
      }

      if (deployment.cluster && isACMPath(pathname)) {
        setClusterInLocalStorage(deployment.cluster);
      }

      if (!isUDNManagedNamespace) {
        await createHeadlessServiceSafely(createdVM, t);
      }

      navigate(getVMURL(deployment.cluster, deployment.project, getName(createdVM)));
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
