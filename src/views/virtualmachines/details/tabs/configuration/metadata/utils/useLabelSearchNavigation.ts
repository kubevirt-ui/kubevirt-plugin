import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import useVMSearchURL from '@multicluster/hooks/useVMSearchURL';

const useLabelSearchNavigation = () => {
  const navigate = useNavigate();
  const searchBaseURL = useVMSearchURL();

  return useCallback(
    (labelKey: string, labelValue: string) => {
      const params = new URLSearchParams({
        labels: `${labelKey}=${labelValue}`,
      });
      navigate(`${searchBaseURL}?${params.toString()}`);
    },
    [navigate, searchBaseURL],
  );
};

export default useLabelSearchNavigation;
