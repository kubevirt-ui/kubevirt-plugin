import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const PreferencePopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      {t('The preferred VirtualMachine attribute values required to run a given workload.')}{' '}
      <ExternalLink href={documentationURL.INSTANCE_TYPES_USER_GUIDE} text={t('Read more')} />
    </>
  );
};

export default PreferencePopoverContent;
