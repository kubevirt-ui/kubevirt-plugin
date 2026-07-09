import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCloneVMModal from '@kubevirt-utils/components/CloneVMModal/hooks/useCloneVMModal';
import {
  cloneVM as createCloneRequest,
  vmExists,
} from '@kubevirt-utils/components/CloneVMModal/utils/helpers';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { logVMCreationFailed } from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { RUNSTRATEGY_HALTED } from '@kubevirt-utils/resources/vm';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import { handleCloneRequestPhaseChange } from './utils/utils';

type UseCloneVM = () => {
  cloneVM: () => Promise<void>;
  error: unknown;
  isSubmitting: boolean;
};

const useCloneVM: UseCloneVM = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { getValues } = useVMWizard();

  const [submittedCloneRequest, setSubmittedCloneRequest] = useState<V1beta1VirtualMachineClone>();
  const [error, setError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cloneRequest = useCloneVMModal(
    getName(submittedCloneRequest),
    getNamespace(submittedCloneRequest),
    getCluster(submittedCloneRequest),
  );

  useEffect(() => {
    handleCloneRequestPhaseChange({
      cloneRequest,
      formValues: getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT),
      navigate,
      setError,
      setIsSubmitting,
      submittedCloneRequest,
      setSubmittedCloneRequest,
      t,
    });
  }, [cloneRequest, getValues, navigate, submittedCloneRequest]);

  const cloneVM = async () => {
    if (isSubmitting || submittedCloneRequest) {
      return;
    }

    const source = vmSignal.value;
    const {
      cluster,
      description,
      name,
      project: targetNamespace,
    } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);

    if (!source) {
      setError(new Error(t('Select a VirtualMachine to clone')));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const targetCluster = getCluster(source) || cluster;
      const vmSameName = await vmExists(name, targetNamespace, targetCluster);

      if (vmSameName) {
        throw new Error(t('VirtualMachine with this name already exists'));
      }

      const shouldStartClonedVM = source.spec?.runStrategy !== RUNSTRATEGY_HALTED;
      const request = await createCloneRequest(
        source,
        name,
        targetNamespace,
        shouldStartClonedVM,
        description,
      );

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
