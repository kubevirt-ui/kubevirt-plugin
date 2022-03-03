import * as React from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

export const CustomizeError = () => {
  const { t } = useKubevirtTranslation();
  return (
    <div className="cos-status-box" data-test-id="error-message">
      <div className="pf-u-text-align-center cos-error-title">
        {t('Error Loading Template: the server could not find the requested resource')}
      </div>
      <div className="pf-u-text-align-center">
        <Trans>
          Please{' '}
          <Button
            type="button"
            onClick={window.location.reload.bind(window.location)}
            variant="link"
            isInline
          >
            try again
          </Button>
          .
        </Trans>
      </div>
    </div>
  );
};
