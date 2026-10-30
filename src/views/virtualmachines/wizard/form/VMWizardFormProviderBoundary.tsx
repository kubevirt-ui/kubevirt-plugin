import { type FC, type PropsWithChildren } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getErrorMessage, isEmpty } from '@kubevirt-utils/utils/utils';
import useResolvedWizardInitialValues from '@virtualmachines/wizard/hooks/useResolvedWizardInitialValues';

import { VMWizardFormProvider } from './VMWizardFormProvider';

export const VMWizardFormProviderBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { cluster, error, isLoading, namespace } = useResolvedWizardInitialValues();

  if (isLoading) return <Loading />;

  if (!isEmpty(error)) throw new Error(getErrorMessage(error));

  return (
    <VMWizardFormProvider initialValues={{ cluster, namespace }}>{children}</VMWizardFormProvider>
  );
};
