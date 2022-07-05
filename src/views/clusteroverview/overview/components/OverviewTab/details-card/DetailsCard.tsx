import * as React from 'react';
import { Link } from 'react-router-dom';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DetailsBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import { OverviewDetailItem } from '@openshift-console/plugin-shared';
import { Card, CardActions, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import { useKubevirtCSVDetails } from './hooks/useKubevirtCSVDetails';
import SourceMissingStatus from './SourceMissingStatus/SourceMissingStatus';
import SubscriptionStatus from './SourceMissingStatus/SubscriptionStatus';

const DetailsCard: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const kvCsvDetails = useKubevirtCSVDetails();
  const {
    displayName,
    provider,
    version,
    updateChannel,
    operatorLink,
    kubevirtSub,
    catalogSourceMissing,
    loaded,
    loadError,
  } = kvCsvDetails;
  const isLoading = !loaded && !loadError && !kubevirtSub;

  return (
    isAdmin && (
      <Card data-test-id="kubevirt-overview-dashboard--details-card">
        <CardHeader>
          <CardTitle>{t('Details')}</CardTitle>
          <CardActions className="co-overview-card__actions">
            {operatorLink && <Link to={operatorLink}>{t('View details')}</Link>}
          </CardActions>
        </CardHeader>
        <CardBody>
          <DetailsBody>
            <OverviewDetailItem isLoading={isLoading} title={t('Service name')}>
              {displayName}
            </OverviewDetailItem>
            <OverviewDetailItem isLoading={isLoading} title={t('Provider')}>
              {provider}
            </OverviewDetailItem>
            <OverviewDetailItem isLoading={isLoading} title={t('OpenShift Virtualization version')}>
              {version}
              <div>
                {catalogSourceMissing ? (
                  <SourceMissingStatus />
                ) : (
                  <SubscriptionStatus subscription={kubevirtSub} />
                )}
              </div>
            </OverviewDetailItem>
            <OverviewDetailItem isLoading={isLoading} title={t('Update Channel')}>
              {updateChannel}
            </OverviewDetailItem>
          </DetailsBody>
        </CardBody>
      </Card>
    )
  );
};

export default DetailsCard;
