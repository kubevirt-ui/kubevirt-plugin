import React, { ReactNode, useMemo } from 'react';

import { DESCHEDULER_ENABLED, DESCHEDULER_NOT_INSTALLED } from '@kubevirt-utils/hooks/constants';
import { DeschedulerStatus } from '@kubevirt-utils/hooks/useDeschedulerInstalled';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { GreenCheckCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { MinusCircleIcon, UnknownIcon } from '@patternfly/react-icons/dist/esm/icons';

type DeschedulerStatusDisplay = { icon: ReactNode; label: string };

const useDeschedulerDisplay = (status: DeschedulerStatus): DeschedulerStatusDisplay => {
  const { t } = useKubevirtTranslation();
  return useMemo(() => {
    switch (status) {
      case DESCHEDULER_ENABLED:
        return {
          icon: <GreenCheckCircleIcon />,
          label: t('Enabled'),
        };
      case DESCHEDULER_NOT_INSTALLED:
        return {
          icon: <MinusCircleIcon color="var(--pf-t--global--icon--color--disabled)" />,
          label: t('Not installed'),
        };
      default:
        return {
          icon: <UnknownIcon color="var(--pf-t--global--icon--color--disabled)" />,
          label: t('Unknown'),
        };
    }
  }, [status, t]);
};

export default useDeschedulerDisplay;
