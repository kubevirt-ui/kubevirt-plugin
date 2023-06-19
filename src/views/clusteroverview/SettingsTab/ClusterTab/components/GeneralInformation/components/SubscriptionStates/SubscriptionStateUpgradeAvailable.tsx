import React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';

type SubscriptionStateUpgradeAvailableProps = {
  operatorLink: string;
};

const SubscriptionStateUpgradeAvailable: React.FC<SubscriptionStateUpgradeAvailableProps> = ({
  operatorLink,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <YellowExclamationTriangleIcon /> {t('Upgrade available')}
      <div className="general-tab__upgrade">
        <ExternalLink href={operatorLink}>{t('Upgrade')}</ExternalLink>
      </div>
    </span>
  );
};

export default SubscriptionStateUpgradeAvailable;
