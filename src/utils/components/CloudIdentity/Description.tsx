import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { CLOUD_IDENTITY_PROVIDER_LABELS } from './constants/constants';
import { type CloudIdentityProvider } from './types/types';
import { getVMServiceAccountName } from './utils/vm';

type DescriptionProps = {
  provider: CloudIdentityProvider;
  vm: V1VirtualMachine;
};

const Description: FC<DescriptionProps> = ({ provider, vm }) => {
  const { t } = useKubevirtTranslation();
  const serviceAccountName = getVMServiceAccountName(vm);

  if (!serviceAccountName) {
    return <MutedTextSpan text={t('Not configured')} />;
  }

  return (
    <span>
      {CLOUD_IDENTITY_PROVIDER_LABELS[provider]}: {serviceAccountName}
    </span>
  );
};

export default Description;
