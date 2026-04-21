import React, { FC } from 'react';
import { Link } from 'react-router';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';

import './VMAlerts.scss';

type TotalAlertCountProps = {
  alertsBaseHref?: string;
  alertsBasePath?: string;
  hasError: boolean;
  loaded: boolean;
  totalAlerts: number;
};

const TotalAlertCount: FC<TotalAlertCountProps> = ({
  alertsBaseHref,
  alertsBasePath,
  hasError,
  loaded,
  totalAlerts,
}) => {
  if (!loaded || hasError) return null;

  if (alertsBasePath) {
    return (
      <Link className="vm-alerts__count" to={alertsBasePath}>
        {totalAlerts}
      </Link>
    );
  }

  if (alertsBaseHref) {
    return (
      <ExternalLink className="vm-alerts__count" hideIcon href={alertsBaseHref}>
        {totalAlerts}
      </ExternalLink>
    );
  }

  return <span className="vm-alerts__count">{totalAlerts}</span>;
};

export default TotalAlertCount;
