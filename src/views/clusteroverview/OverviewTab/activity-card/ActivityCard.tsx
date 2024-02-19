import React, { FC, memo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActivityBody } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, CardHeader, CardTitle } from '@patternfly/react-core';

import { VIEW_EVENTS_PATH } from './utils/constants';
import OngoingActivity from './utils/OngoingActivity';
import RecentEvent from './utils/RecentEvent';

const ActivityCard: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  return (
    <Card className="co-overview-card--gradient" data-test-id="kv-activity-card">
      <CardHeader
        actions={{
          actions: <Link to={VIEW_EVENTS_PATH}>{t('View events')}</Link>,
          className: 'co-overview-card__actions',
          hasNoOffset: false,
        }}
      >
        <CardTitle>{t('Activity')}</CardTitle>
      </CardHeader>
      <ActivityBody className="co-overview-dashboard__activity-body">
        <OngoingActivity />
        <RecentEvent />
      </ActivityBody>
    </Card>
  );
});

export default ActivityCard;
