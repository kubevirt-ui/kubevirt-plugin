import React, { ReactNode, useMemo } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import {
  DESCHEDULER_ENABLED,
  DESCHEDULER_NOT_ENABLED,
  DESCHEDULER_NOT_INSTALLED,
} from '@kubevirt-utils/hooks/constants';
import { DeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { GreenCheckCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/icons';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { UnknownIcon } from '@patternfly/react-icons';
import {
  DESCHEDULER_OPERATOR_NAME,
  OPERATOR_HUB_PATH,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

type DeschedulerStatusDisplay = { icon: ReactNode; label: string };

const useDeschedulerDisplay = (status: DeschedulerStatus): DeschedulerStatusDisplay => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const { getConsoleURL } = useManagedClusterConsoleURLs();
  const { operatorDetailsMap } = useVirtualizationFeaturesContext();

  const spokeConsoleURL = getConsoleURL(cluster);
  const hubOperatorHubURL =
    operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME]?.operatorHubURL ?? OPERATOR_HUB_PATH;
  const operatorHubURL = spokeConsoleURL
    ? `${spokeConsoleURL}${hubOperatorHubURL}`
    : hubOperatorHubURL;

  return useMemo(() => {
    switch (status) {
      case DESCHEDULER_ENABLED:
        return {
          icon: <GreenCheckCircleIcon />,
          label: t('Enabled'),
        };
      case DESCHEDULER_NOT_ENABLED:
        return {
          icon: (
            <Popover
              bodyContent={t(
                'The Descheduler Operator is installed but not enabled. Create a KubeDescheduler instance to enable automatic workload balancing.',
              )}
              footerContent={
                <ExternalLink href={documentationURL.DESCHEDULER_ENABLING}>
                  {t('Enabling descheduler documentation')}
                </ExternalLink>
              }
            >
              <Button hasNoPadding icon={<BlueInfoCircleIcon />} variant={ButtonVariant.plain} />
            </Popover>
          ),
          label: t('Not enabled'),
        };
      case DESCHEDULER_NOT_INSTALLED:
        return {
          icon: (
            <Popover
              bodyContent={t(
                'To enable automatic workload balancing, install the Descheduler Operator from the Operator page.',
              )}
              footerContent={
                <ExternalLink href={operatorHubURL}>{t('Operator page')}</ExternalLink>
              }
            >
              <Button hasNoPadding icon={<BlueInfoCircleIcon />} variant={ButtonVariant.plain} />
            </Popover>
          ),
          label: t('Not installed'),
        };
      default:
        return {
          icon: <UnknownIcon color="var(--pf-t--global--icon--color--disabled)" />,
          label: t('Unknown'),
        };
    }
  }, [status, t, operatorHubURL]);
};

export default useDeschedulerDisplay;
