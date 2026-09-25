import { type FC, type PropsWithChildren } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getErrorMessage, isEmpty } from '@kubevirt-utils/utils/utils';
import useWizardInitialValues from '@virtualmachines/wizard/hooks/useWizardInitialValues';

import { VMWizardFormProvider } from './VMWizardFormProvider';

export const VMWizardFormProviderBoundary: FC<PropsWithChildren> = ({ children }) => {
  const { cluster, hubClusterError, isLoadingHubCluster, namespace } = useWizardInitialValues();

  if (isLoadingHubCluster) return <Loading />;

  if (!isEmpty(hubClusterError)) throw new Error(getErrorMessage(hubClusterError));

  return (
    <VMWizardFormProvider initialValues={{ cluster, namespace }}>{children}</VMWizardFormProvider>
  );
};
