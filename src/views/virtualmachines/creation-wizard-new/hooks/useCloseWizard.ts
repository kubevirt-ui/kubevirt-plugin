import { useNavigate, useParams } from 'react-router';

import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getVMListURL } from '@multicluster/urls';

type UseCloseWizard = () => () => void;

const useCloseWizard: UseCloseWizard = () => {
  const navigate = useNavigate();
  const clusterParam = useClusterParam();
  const { ns } = useParams<{ ns: string }>();
  const vmListURL = getVMListURL(clusterParam, ns);

  const closeWizard = () => {
    navigate(vmListURL);
  };

  return closeWizard;
};

export default useCloseWizard;
