import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import { CapabilityFeatureOperator, CapabilityInstallState } from '../../utils/types';
import { CAPABILITY_INSTALL_STATE_CONFIG } from '../../utils/constants';

type CapabilityCardActionsProps = {
  installState: CapabilityInstallState;
  operators: CapabilityFeatureOperator[];
};

const CapabilityCardActions: FC<CapabilityCardActionsProps> = ({ installState, operators }) => {
  const { t } = useKubevirtTranslation();
  const { color, getLabel } = CAPABILITY_INSTALL_STATE_CONFIG[installState];

  return (
    <Split hasGutter>
      <SplitItem>
        <Label color={color} isCompact>
          {getLabel(t)}
        </Label>
      </SplitItem>
      <SplitItem>
        <HelpTextIcon
          bodyContent={
            <Stack>
              {operators.map(({ packageName }) => (
                <StackItem key={packageName}>{packageName}</StackItem>
              ))}
            </Stack>
          }
          headerContent={t('Included operators')}
        />
      </SplitItem>
    </Split>
  );
};

export default CapabilityCardActions;
