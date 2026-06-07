import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const useLabelSearchNavigation = (): ((labelKey: string, labelValue: string) => void) => {
  const navigate = useNavigate();
  const cluster = useActiveClusterParam();
  const isACMPage = useIsACMPage();

  return useCallback(
    (labelKey: string, labelValue: string) => {
      const params = new URLSearchParams({
        [VirtualMachineRowFilterType.Labels]: `${labelKey}=${labelValue}`,
      });
      const base = isACMPage ? getACMVMListURL(cluster) : getVMListURL();
      navigate(`${base}?${params.toString()}`);
    },
    [navigate, cluster, isACMPage],
  );
};

export default useLabelSearchNavigation;
