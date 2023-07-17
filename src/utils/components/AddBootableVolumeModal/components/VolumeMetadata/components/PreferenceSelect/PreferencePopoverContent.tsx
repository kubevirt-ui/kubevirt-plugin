import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const PreferencePopoverContent: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      {t('The preferred VirtualMachine attribute values required to run a given workload.')}{' '}
      <ExternalLink
        href={
          'https://kubevirt.io/user-guide/virtual_machines/instancetypes/#virtualmachinepreference'
        }
        text={t('Read more')}
      />
    </>
  );
};

export default PreferencePopoverContent;
