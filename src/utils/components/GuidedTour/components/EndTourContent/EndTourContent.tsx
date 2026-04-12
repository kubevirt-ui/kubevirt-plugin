import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const EndTourContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t}>
      You&apos;re ready to start managing your VMs. For more tips and deep dives, check out our{' '}
      <a
        href={documentationURL.VIRTUALIZATION_WHAT_YOU_CAN_DO}
        rel="noopener noreferrer"
        target="_blank"
      >
        documentation
      </a>{' '}
      or follow the{' '}
      <a href={documentationURL.REDHAT_BLOG} rel="noopener noreferrer" target="_blank">
        blog
      </a>
      .
    </Trans>
  );
};

export default EndTourContent;
