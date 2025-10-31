import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Spinner } from '@patternfly/react-core';

export const ResultsStatus: FC<{
  isJobFailed: boolean;
  isLoadingResults: boolean;
  isResultsError: boolean;
}> = ({ isJobFailed, isLoadingResults, isResultsError }) => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      {(() => {
        if (isLoadingResults) {
          return <Spinner size="sm" />;
        } else if (isResultsError) {
          return <>{t('Error loading results')}</>;
        } else if (isJobFailed) {
          return <>{t('Self validation checkup failed')}</>;
        }
        return <>{t('Results available')}</>;
      })()}
    </span>
  );
};
