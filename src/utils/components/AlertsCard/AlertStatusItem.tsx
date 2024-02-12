import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { AlertType, SimplifiedAlert } from '@kubevirt-utils/components/AlertsCard/utils/types';
import { alertIcon } from '@kubevirt-utils/components/AlertsCard/utils/utils';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import './AlertStatusItem.scss';

type AlertStatusItemProps = {
  alertDetails: SimplifiedAlert;
  alertType: AlertType;
};

const AlertStatusItem: React.FC<AlertStatusItemProps> = ({ alertDetails, alertType }) => {
  const { t } = useKubevirtTranslation();
  const { alertName, description, isVMAlert, link, time } = alertDetails;
  const Icon = alertIcon[alertType];

  return (
    <div className="alert-item">
      <div className="alert-item__icon co-dashboard-icon">
        <Icon />
      </div>
      <div className="alert-item__text">
        <div className="alert-item__message">
          <div className="alert-item__header alert-item__text text-secondary" data-test="timestamp">
            <span className="co-resource-item__resource-name">
              {isVMAlert && (
                <span className="co-m-resource-icon co-m-resource-icon--md alert-item__resource-icon">
                  {t('VM')}
                </span>
              )}
              <Timestamp className="alert-item__timestamp" hideIcon timestamp={time} />
            </span>
          </div>
          <div className="alert-name">{alertName}</div>
          <span className="alert-item__text co-break-word">{description}</span>
        </div>
        <div className="alert-item__more">
          <Link to={link}>{t('View alert')}</Link>
        </div>
      </div>
    </div>
  );
};

export default AlertStatusItem;
