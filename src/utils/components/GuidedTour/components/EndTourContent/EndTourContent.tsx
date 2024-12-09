import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const EndTourContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t}>
      Thank you for taking the tour.
      <br />
      Stay up-to-date with Openshift Virtualization on our{' '}
      <Link target="_blank" to={documentationURL.REDHAT_BLOG}>
        Blog
      </Link>{' '}
      or continue to learn more in our{' '}
      <Link target="_blank" to={documentationURL.VIRTUALIZATION_WHAT_YOU_CAN_DO}>
        documentation
      </Link>
      .
    </Trans>
  );
};

export default EndTourContent;
