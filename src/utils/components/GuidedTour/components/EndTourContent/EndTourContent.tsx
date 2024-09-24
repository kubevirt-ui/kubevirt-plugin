import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const EndTourContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t}>
      Thank you for taking the tour.
      <br />
      Stay up-to-date with Openshift Virtualization on our{' '}
      <Link target="_blank" to="https://www.redhat.com/en/blog/channel/red-hat-openshift">
        Blog
      </Link>{' '}
      or continue to learn more in our{' '}
      <Link
        target="_blank"
        to="https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/virtualization/about#virt-what-you-can-do-with-virt_about-virt"
      >
        documentation
      </Link>
      .
    </Trans>
  );
};

export default EndTourContent;
