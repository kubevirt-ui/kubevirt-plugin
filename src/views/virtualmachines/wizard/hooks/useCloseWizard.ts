import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { getVMListURL } from '@multicluster/urls';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';

type UseCloseWizard = () => () => void;

const useCloseWizard: UseCloseWizard = () => {
  const navigate = useNavigate();
  const { control } = useFormContext<VMWizardFormValues>();
  const cluster = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER });
  const namespace = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT });
  const vmListURL = useMemo(() => getVMListURL(cluster ?? '', namespace), [cluster, namespace]);

  const navigateToVMList = (): void => {
    navigate(vmListURL);
  };

  return navigateToVMList;
};

export default useCloseWizard;
