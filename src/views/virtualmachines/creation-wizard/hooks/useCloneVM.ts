import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { V1beta1VirtualMachineClone } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useCloneVMModal from '@kubevirt-utils/components/CloneVMModal/hooks/useCloneVMModal';
import { CLONING_STATUSES } from '@kubevirt-utils/components/CloneVMModal/utils/constants';
import { cloneVM, vmExists } from '@kubevirt-utils/components/CloneVMModal/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { RUNSTRATEGY_HALTED } from '@kubevirt-utils/resources/vm/utils/constants';
import { vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMURL } from '@multicluster/urls';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

type UseCloneVM = () => () => Promise<void>;

const useCloneVM: UseCloneVM = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { cloneVMDescription, cloneVMName, cluster, project: targetNamespace } = useVMWizardStore();

  const source = vmSignal.value;

  const [initialCloneRequest, setInitialCloneRequest] = useState<V1beta1VirtualMachineClone>();

  const cloneRequest = useCloneVMModal(
    getName(initialCloneRequest),
    getNamespace(initialCloneRequest),
    getCluster(initialCloneRequest),
  );

  useEffect(() => {
    if (cloneRequest?.status?.phase === CLONING_STATUSES.SUCCEEDED) {
      navigate(getVMURL(cloneRequest?.cluster, targetNamespace, cloneVMName));
    }
  }, [cloneRequest, cloneVMName, targetNamespace, navigate, source]);

  const sendCloneRequest = async () => {
    const vmSameName = await vmExists(cloneVMName, targetNamespace, getCluster(source) || cluster);

    if (vmSameName) {
      throw new Error(t('VirtualMachine with this name already exists'));
    }

    const request = await cloneVM(
      source,
      cloneVMName,
      targetNamespace,
      vmSignal.value?.spec?.runStrategy !== RUNSTRATEGY_HALTED,
      cloneVMDescription,
    );

    setInitialCloneRequest(request);
  };

  return sendCloneRequest;
};

export default useCloneVM;
