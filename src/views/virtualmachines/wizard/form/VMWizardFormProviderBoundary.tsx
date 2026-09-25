import { type FC, type ReactNode } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getErrorMessage, isEmpty } from '@kubevirt-utils/utils/utils';
import useWizardInitialValues from '@virtualmachines/wizard/hooks/useWizardInitialValues';

import { VMWizardFormProvider, type VMWizardFormResources } from './VMWizardFormProvider';

type VMWizardFormProviderBoundaryProps = {
  children: (resources: VMWizardFormResources) => ReactNode;
};

export const VMWizardFormProviderBoundary: FC<VMWizardFormProviderBoundaryProps> = ({
  children,
}) => {
  const { cluster, hubClusterError, isLoadingHubCluster, namespace } = useWizardInitialValues();

  if (isLoadingHubCluster) return <Loading />;

  if (!isEmpty(hubClusterError)) throw new Error(getErrorMessage(hubClusterError));

  return (
    <VMWizardFormProvider initialValues={{ cluster, namespace }}>{children}</VMWizardFormProvider>
  );
};
