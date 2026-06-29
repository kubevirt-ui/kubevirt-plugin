import React, { FC, ReactNode, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { clearCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { createInitialVMWizardFormValues } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { VMWizardFormValues } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/types';

type VMWizardProviderProps = {
  children?: ReactNode;
};

export const VMWizardProvider: FC<VMWizardProviderProps> = ({ children }) => {
  const clusterParam = useClusterParam();
  const activeNamespace = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);
  const methods = useForm<VMWizardFormValues>({
    defaultValues: createInitialVMWizardFormValues({ cluster: clusterParam ?? '', namespace }),
  });

  // TODO: delete useEffect after migration to form is completed
  useEffect(
    () => () => {
      clearCustomizeInstanceType();
    },
    [],
  );

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export const useVMWizard = () => {
  const context = useFormContext<VMWizardFormValues>();

  if (!context?.control) {
    throw new Error('useVMWizard must be used within VMWizardProvider');
  }

  return context;
};
