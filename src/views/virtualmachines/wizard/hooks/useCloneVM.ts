import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCloneVMModal from '@kubevirt-utils/components/CloneVMModal/hooks/useCloneVMModal';
import {
  cloneVM as createCloneRequest,
  vmExists,
} from '@kubevirt-utils/components/CloneVMModal/utils/helpers';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMCreationFailed } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { RUNSTRATEGY_HALTED } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { isACMPath } from '@multicluster/urls';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

import { SELECTED_CLUSTER } from '../utils/constants';
import { handleCloneRequestPhaseChange } from './utils/utils';

type UseCloneVM = () => {
  cloneVM: (values: VMWizardFormValues) => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCloneVM: UseCloneVM = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { getValues } = useVMWizardForm();

  const [submittedCloneRequest, setSubmittedCloneRequest] = useState<V1beta1VirtualMachineClone>();
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_clusterFromLocalStorage, setClusterInLocalStorage] = useLocalStorage(
    SELECTED_CLUSTER.LOCAL_STORAGE_KEY,
  );

  const cloneRequest = useCloneVMModal(
    getName(submittedCloneRequest),
    getNamespace(submittedCloneRequest),
    getCluster(submittedCloneRequest),
  );

  useEffect(() => {
    handleCloneRequestPhaseChange({
      cloneRequest,
      formValues: getValues('deployment'),
      navigate,
      setError,
      setIsSubmitting,
      setSubmittedCloneRequest,
      submittedCloneRequest,
      t,
    });
  }, [cloneRequest, getValues, navigate, submittedCloneRequest, t]);

  const cloneVM = async (values: VMWizardFormValues): Promise<void> => {
    if (isSubmitting || submittedCloneRequest) {
      return;
    }

    const {
      clone: { sourceVM: source },
      deployment: {
        cluster: targetCluster,
        description: targetDescription,
        name: targetName,
        project: targetProject,
      },
    } = values;

    if (!source) {
      setError(new Error(t('Select a VirtualMachine to clone')));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const cloneCluster = getCluster(source) ?? targetCluster;
      const sourceName = getName(source) ?? '';
      const vmToClonePromise = vmExists(sourceName, getNamespace(source) ?? '', cloneCluster);

      const targetVMAlreadyExistsPromise = vmExists(targetName, targetProject, cloneCluster);

      const [vmToClone, targetVMAlreadyExists] = await Promise.all([
        vmToClonePromise,
        targetVMAlreadyExistsPromise,
      ]);

      if (isEmpty(vmToClone)) {
        throw new Error(t('{{name}} VirtualMachine no longer exists', { name: sourceName }));
      }

      if (targetVMAlreadyExists) {
        throw new Error(t('VirtualMachine with this name already exists'));
      }

      const request = await createCloneRequest(
        source,
        targetName,
        targetProject,
        source.spec?.runStrategy !== RUNSTRATEGY_HALTED,
        targetDescription,
      );

      if (cloneCluster && isACMPath(pathname)) {
        setClusterInLocalStorage(cloneCluster);
      }

      setSubmittedCloneRequest(request);
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
      logVMCreationFailed(TELEMETRY_VM_CREATION_METHOD.CLONE, err);
    }
  };

  return {
    cloneVM,
    error,
    isSubmitting,
  };
};

export default useCloneVM;
