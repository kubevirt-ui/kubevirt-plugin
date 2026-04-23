import React, { FC } from 'react';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import ExternalLink from '../ExternalLink/ExternalLink';

import { AlertType, SimplifiedAlert } from './utils/types';
import { alertIcon } from './utils/utils';

import './AlertStatusItem.scss';

type AlertStatusItemACMProps = {
  alertDetails: SimplifiedAlert;
  alertType: AlertType;
};

const AlertStatusItemACM: FC<AlertStatusItemACMProps> = ({ alertDetails, alertType }) => {
  const { t } = useKubevirtTranslation();
  const { alertName, externalLink, isVMAlert, link, namespace, vmName } = alertDetails;
  const Icon = alertIcon[alertType];

  const linkText =
    alertType === AlertType.critical ? t('View alert') : t('View {{alertType}}', { alertType });

  const renderAlertLink = () => {
    // For spoke cluster alerts, open external link in new tab
    if (externalLink) {
      return <ExternalLink href={externalLink} text={linkText} />;
    }

    // For hub cluster alerts, use internal link
    return (
      <Button component="a" href={link} isInline variant="link">
        {linkText}
      </Button>
    );
  };

  return (
    <div className="alert-item">
      <div className="alert-item__icon co-dashboard-icon">
        <Icon />
      </div>
      <div className="alert-item__text">
        <div className="alert-item__message">
          <div className="alert-item__title">
            {isVMAlert && (
              <span className="co-m-resource-icon co-m-resource-icon--md alert-item__resource-icon">
                {VirtualMachineModel.abbr}
              </span>
            )}
            <span className="alert-name">{alertName}</span>
          </div>
          {isVMAlert && (
            <div className="alert-item__vm-details pf-v6-u-text-color-subtle">
              <div>{t('VirtualMachine name: {{vmName}}', { vmName })}</div>
              <div>{t('Namespace: {{namespace}}', { namespace })}</div>
            </div>
          )}
        </div>
        <div className="alert-item__more">{renderAlertLink()}</div>
      </div>
    </div>
  );
};

export default AlertStatusItemACM;
