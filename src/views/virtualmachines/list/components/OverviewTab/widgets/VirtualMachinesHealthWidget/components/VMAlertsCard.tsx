import React, { FCC, PropsWithChildren, ReactNode } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { Bullseye, Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

import ViewAllLink from '../../shared/ViewAllLink';
import { VMAlertsProps } from '../utils/vmAlerts';

import './health-card.scss';
import './VMAlerts.scss';

type VMAlertsCardProps = PropsWithChildren<
  VMAlertsProps & {
    titleExtra?: ReactNode;
  }
>;

const VMAlertsCard: FCC<VMAlertsCardProps> = ({
  alertsBaseHref,
  alertsBasePath,
  children,
  titleExtra,
}) => {
  const { t } = useKubevirtTranslation();
  const baseUrl = alertsBasePath || alertsBaseHref;

  return (
    <Card className="vm-alerts health-card" data-test="vm-alerts-widget" isCompact>
      <CardHeader
        actions={
          baseUrl
            ? {
                actions: <ViewAllLink href={alertsBaseHref} linkPath={alertsBasePath} />,
                hasNoOffset: false,
              }
            : undefined
        }
        className="health-card__header"
      >
        <CardTitle>
          {t('Virtual machine alerts')}
          {titleExtra}
        </CardTitle>
      </CardHeader>
      <CardBody className="vm-alerts__body">
        {children ?? (
          <Bullseye>
            <MutedTextSpan text={getNoDataAvailableMessage(t)} />
          </Bullseye>
        )}
      </CardBody>
    </Card>
  );
};

export default VMAlertsCard;
