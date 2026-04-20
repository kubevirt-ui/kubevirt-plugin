import React, { FCC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const EndTourFooter: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="kv-tour-popover__feedback-footer">
      <Trans t={t}>
        Have thoughts on this tour? We&apos;d love to hear your{' '}
        <Link target="_blank" to={'mailto:uxdresearch@redhat.com'}>
          feedback
        </Link>
        .
      </Trans>
    </div>
  );
};

export default EndTourFooter;
