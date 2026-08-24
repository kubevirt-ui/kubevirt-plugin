import React, { type FC, type ReactNode, useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useWizardInitialValues from '@virtualmachines/wizard/hooks/useWizardInitialValues';
import { createInitialVMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { clearVMPendingUploadsAndSignal } from '@virtualmachines/wizard/utils/utils';

type VMWizardProviderProps = {
  children?: ReactNode;
};

export const VMWizardProvider: FC<VMWizardProviderProps> = ({ children }) => {
  const { cluster, hubClusterError, isLoadingHubCluster, namespace } = useWizardInitialValues();

  const methods = useForm<VMWizardFormValues>({
    defaultValues: createInitialVMWizardFormValues({ cluster, namespace }),
  });

  useEffect(() => (): void => clearVMPendingUploadsAndSignal(), []);

  if (isLoadingHubCluster) {
    return <Loading />;
  }

  if (!isEmpty(hubClusterError)) {
    throw new Error(hubClusterError?.message ?? hubClusterError?.toString());
  }

  return <FormProvider {...methods}>{children}</FormProvider>;
};

export const useVMWizard = () => {
  const context = useFormContext<VMWizardFormValues>();

  if (!context?.control) {
    throw new Error('useVMWizard must be used within VMWizardProvider');
  }

  return context;
};
