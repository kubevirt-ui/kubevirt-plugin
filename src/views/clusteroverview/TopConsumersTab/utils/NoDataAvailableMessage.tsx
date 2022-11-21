import * as React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { NON_VCPU_LINK, vCPU_LINK } from './constants';

import './NoDataAvailableMessage.scss';

type NoDataAvailableMessageProps = {
  isVCPU: boolean;
};

const NoDataAvailableMessage: React.FC<NoDataAvailableMessageProps> = ({ isVCPU = false }) => {
  const { t } = useKubevirtTranslation();

  const nonVCPUMessage = t('Metrics are collected by the OpenShift Monitoring Operator.');
  const vcpuMessage = t(
    'To see the vCPU metric, you must set the schedstats=enable kernel argument in the MachineConfig object.',
  );

  const bodyContent = (
    <div>
      {isVCPU ? vcpuMessage : nonVCPUMessage}
      <div>
        {' '}
        <div className="kv-top-consumers-card__chart-list-no-data-msg--link">
          <ExternalLink href={isVCPU ? vCPU_LINK : NON_VCPU_LINK} text={t('Learn more')} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="kv-top-consumers-card__chart-list-no-data-msg pf-u-text-align-center">
      {t('No data available')}
      <Popover aria-label={t('Help')} bodyContent={bodyContent}>
        <HelpIcon className="kv-top-consumers-card__chart-list-no-data-msg--icon" />
      </Popover>
    </div>
  );
};

export default NoDataAvailableMessage;
