import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { getVMListURL } from '@multicluster/urls';
import { type VMWizardFormValues } from '@virtualmachines/wizard/form/types';

type UseCloseWizard = () => () => void;

const useCloseWizard: UseCloseWizard = () => {
  const navigate = useNavigate();
  const { control } = useFormContext<VMWizardFormValues>();
  const [cluster, namespace] = useWatch({
    control,
    name: ['deployment.cluster', 'deployment.project'],
  });
  const vmListURL = useMemo(() => getVMListURL(cluster ?? '', namespace), [cluster, namespace]);

  const navigateToVMList = (): void => {
    navigate(vmListURL);
  };

  return navigateToVMList;
};

export default useCloseWizard;
