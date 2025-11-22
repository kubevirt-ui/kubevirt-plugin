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
      {isLoadingResults && <Spinner aria-label={t('Loading results')} size="sm" />}
      {!isLoadingResults && isResultsError && t('Error loading results')}
      {!isLoadingResults && !isResultsError && isJobFailed && t('Self validation checkup failed')}
      {!isLoadingResults && !isResultsError && !isJobFailed && t('Results available')}
    </span>
  );
};
