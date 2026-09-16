import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';

import useAdvisorRouteURL from '../hooks/useAdvisorRouteURL';
import useClusterRecommendation from '../hooks/useClusterRecommendation';
import ClusterRecommendationPanel from './ClusterRecommendationPanel';

type ClusterRecommendationSectionProps = {
  onRecommendationSelect: (cluster: string) => void;
  vmQueryParams: {
    cluster: string;
    vmName: string;
    vmNamespace: string;
  };
};

const ClusterRecommendationSection: FC<ClusterRecommendationSectionProps> = ({
  onRecommendationSelect,
  vmQueryParams,
}) => {
  const { t } = useKubevirtTranslation();
  const [advisorBaseURL] = useAdvisorRouteURL();
  const {
    data: recData,
    error: recError,
    fetchRecommendation,
    loaded: recLoaded,
    loading: recLoading,
  } = useClusterRecommendation(advisorBaseURL, vmQueryParams);

  if (!advisorBaseURL) {
    return null;
  }

  return (
    <>
      <Button
        icon={<WrenchIcon />}
        isDisabled={recLoading}
        onClick={fetchRecommendation}
        variant={ButtonVariant.secondary}
      >
        {t('Get cluster recommendation')}
      </Button>
      <ClusterRecommendationPanel
        data={recData}
        error={recError}
        loaded={recLoaded}
        loading={recLoading}
        onSelectCluster={onRecommendationSelect}
      />
    </>
  );
};

export default ClusterRecommendationSection;
