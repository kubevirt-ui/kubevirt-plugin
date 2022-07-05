import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StatusPopupItem, StatusPopupSection } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';

import { healthStateMapping } from '../utils';

type StatusCardStoragePopoverProps = {
  lsoState: any;
  odfState: any;
};

const StatusCardStoragePopover: React.FC<StatusCardStoragePopoverProps> = ({
  lsoState,
  odfState,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'OpenShift Data Foundation (recommended for full functionality) or another persistent storage service is required for OpenShift Virtualization',
        )}
      </StackItem>
      <StackItem>
        <StatusPopupSection firstColumn={t('Storage operator')} secondColumn={t('Status')}>
          <StatusPopupItem
            key="lso"
            value={lsoState.message}
            icon={healthStateMapping[lsoState.state].icon}
          >
            {t('Local storage (LSO)')}
          </StatusPopupItem>
          <StatusPopupItem
            key="odf"
            value={odfState.message}
            icon={healthStateMapping[odfState.state].icon}
          >
            {t('OpenShift Data Foundation (ODF)')}
          </StatusPopupItem>
        </StatusPopupSection>
      </StackItem>
    </Stack>
  );
};

export default StatusCardStoragePopover;
