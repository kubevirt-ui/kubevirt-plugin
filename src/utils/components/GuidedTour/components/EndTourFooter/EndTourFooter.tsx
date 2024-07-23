import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const EndTourFooter: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="kv-tour-popover__feedback-footer">
      <Trans t={t}>
        We hope you found this tour helpful.
        <br />
        If you have any{' '}
        <Link target="_blank" to={'mailto:uxdresearch@redhat.com'}>
          feedback
        </Link>
        , we would appreciate hearing from you.
      </Trans>
    </div>
  );
};

export default EndTourFooter;
