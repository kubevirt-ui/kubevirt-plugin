import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { INSTANCE_TYPES_USER_GUIDE_LINK } from '@kubevirt-utils/constants/url-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const PreferencePopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      {t('The preferred VirtualMachine attribute values required to run a given workload.')}{' '}
      <ExternalLink
        href={`${INSTANCE_TYPES_USER_GUIDE_LINK}#virtualmachinepreference`}
        text={t('Read more')}
      />
    </>
  );
};

export default PreferencePopoverContent;
