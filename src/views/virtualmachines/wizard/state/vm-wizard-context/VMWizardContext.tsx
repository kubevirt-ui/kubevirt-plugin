import React, { FC, ReactNode, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import useClusterParam from '@multicluster/hooks/useClusterParam';
import useInitialNamespace from '@virtualmachines/wizard/hooks/useInitialNamespace';
import { createInitialVMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { clearVMPendingUploadsAndSignal } from '@virtualmachines/wizard/utils/utils';

type VMWizardProviderProps = {
  children?: ReactNode;
};

export const VMWizardProvider: FC<VMWizardProviderProps> = ({ children }) => {
  const clusterParam = useClusterParam();
  const namespace = useInitialNamespace();
  const methods = useForm<VMWizardFormValues>({
    defaultValues: createInitialVMWizardFormValues({ cluster: clusterParam ?? '', namespace }),
  });

  useEffect(() => () => clearVMPendingUploadsAndSignal(), []);

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export const useVMWizard = () => {
  const context = useFormContext<VMWizardFormValues>();

  if (!context?.control) {
    throw new Error('useVMWizard must be used within VMWizardProvider');
  }

  return context;
};
