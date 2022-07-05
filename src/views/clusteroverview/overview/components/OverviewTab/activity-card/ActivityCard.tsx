import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActivityBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, CardActions, CardHeader, CardTitle } from '@patternfly/react-core';

import { VIEW_EVENTS_PATH } from './utils/constants';
import OngoingActivity from './utils/OngoingActivity';
import RecentEvent from './utils/RecentEvent';

const ActivityCard: React.FC = React.memo(() => {
  const { t } = useKubevirtTranslation();
  return (
    <Card className="co-overview-card--gradient" data-test-id="kv-activity-card">
      <CardHeader>
        <CardTitle>{t('Activity')}</CardTitle>
        <CardActions className="co-overview-card__actions">
          <Link to={VIEW_EVENTS_PATH}>{t('View events')}</Link>
        </CardActions>
      </CardHeader>
      <ActivityBody className="co-overview-dashboard__activity-body">
        <OngoingActivity />
        <RecentEvent />
      </ActivityBody>
    </Card>
  );
});

export default ActivityCard;
