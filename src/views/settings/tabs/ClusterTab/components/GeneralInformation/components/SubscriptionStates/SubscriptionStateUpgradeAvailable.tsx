import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import SettingsLink from '@settings/context/SettingsLink';

type SubscriptionStateUpgradeAvailableProps = {
  operatorLink: string;
};

const SubscriptionStateUpgradeAvailable: React.FCC<SubscriptionStateUpgradeAvailableProps> = ({
  operatorLink,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <span>
      <YellowExclamationTriangleIcon /> {t('Upgrade available')}
      <div className="general-tab__upgrade">
        <SettingsLink showExternalIcon to={operatorLink}>
          {t('Upgrade')}
        </SettingsLink>
      </div>
    </span>
  );
};

export default SubscriptionStateUpgradeAvailable;
