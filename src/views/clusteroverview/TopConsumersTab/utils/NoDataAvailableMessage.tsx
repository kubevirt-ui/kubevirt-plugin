import * as React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

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
          <ExternalLink
            href={isVCPU ? documentationURL.vCPU_LINK : documentationURL.NON_VCPU_LINK}
            text={t('Learn more')}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="kv-top-consumers-card__chart-list-no-data-msg pf-v5-u-text-align-center">
      {t('No data available')}
      <HelpTextIcon
        bodyContent={bodyContent}
        helpIconClassName="kv-top-consumers-card__chart-list-no-data-msg--icon"
      />
    </div>
  );
};

export default NoDataAvailableMessage;
