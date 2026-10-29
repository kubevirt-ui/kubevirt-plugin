import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import useAllowedNamespaces from '@kubevirt-utils/hooks/useAllowedNamespaces/useAllowedNamespaces';
import { getVmCreateFleetAccessReview } from '@virtualmachines/list/utils/utils';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';

const VMCreationWizardAllowedNamespacesPrefetch: FC = () => {
  const { control } = useVMWizardForm();
  const cluster = useWatch({
    control,
    name: 'deployment.cluster',
  });

  const vmCreateAccessReview = useMemo(() => getVmCreateFleetAccessReview(cluster), [cluster]);

  useAllowedNamespaces(vmCreateAccessReview);

  return null;
};

export default VMCreationWizardAllowedNamespacesPrefetch;
