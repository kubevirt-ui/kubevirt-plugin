import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCloneVMModal from '@kubevirt-utils/components/CloneVMModal/hooks/useCloneVMModal';
import { CLONING_STATUSES } from '@kubevirt-utils/components/CloneVMModal/utils/constants';
import { cloneVM, vmExists } from '@kubevirt-utils/components/CloneVMModal/utils/helpers';
import { TELEMETRY_VM_CREATION_METHOD } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import {
  logVMCreated,
  logVMCreationFailed,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { RUNSTRATEGY_HALTED } from '@kubevirt-utils/resources/vm/utils/constants';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';

type UseCloneVM = () => () => Promise<void>;

const useCloneVM: UseCloneVM = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { getValues } = useVMWizard();

  const source = vmSignal.value;

  const [initialCloneRequest, setInitialCloneRequest] = useState<V1beta1VirtualMachineClone>();

  const cloneRequest = useCloneVMModal(
    getName(initialCloneRequest),
    getNamespace(initialCloneRequest),
    getCluster(initialCloneRequest),
  );

  useEffect(() => {
    const { name, project: targetNamespace } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);

    if (cloneRequest?.status?.phase === CLONING_STATUSES.SUCCEEDED) {
      logVMCreated(TELEMETRY_VM_CREATION_METHOD.CLONE);
      navigate(getVMURL(cloneRequest?.cluster, targetNamespace, name));
    }
  }, [cloneRequest, navigate, source, getValues]);

  const sendCloneRequest = async () => {
    const {
      cluster,
      description,
      name,
      project: targetNamespace,
    } = getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);
    try {
      const vmSameName = await vmExists(name, targetNamespace, getCluster(source) || cluster);

      if (vmSameName) {
        throw new Error(t('VirtualMachine with this name already exists'));
      }

      const request = await cloneVM(
        source,
        name,
        targetNamespace,
        vmSignal.value?.spec?.runStrategy !== RUNSTRATEGY_HALTED,
        description,
      );

      setInitialCloneRequest(request);
    } catch (err) {
      logVMCreationFailed(TELEMETRY_VM_CREATION_METHOD.CLONE, err);
      throw err;
    }
  };

  return sendCloneRequest;
};

export default useCloneVM;
