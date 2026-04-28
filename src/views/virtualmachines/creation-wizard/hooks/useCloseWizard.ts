import { useNavigate, useParams } from 'react-router';

import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getVMListURL } from '@multicluster/urls';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

type UseCloseWizard = () => () => void;

const useCloseWizard: UseCloseWizard = () => {
  const navigate = useNavigate();
  const { resetWizardState } = useVMWizardStore();
  const clusterParam = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const vmListURL = getVMListURL(clusterParam, ns);

  const closeWizard = () => {
    resetWizardState();
    navigate(vmListURL);
  };

  return closeWizard;
};

export default useCloseWizard;
