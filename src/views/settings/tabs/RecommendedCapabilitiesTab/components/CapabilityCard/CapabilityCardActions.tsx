import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Skeleton, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { useCapabilitiesActions } from '../../context/useCapabilitiesActions';
import { CapabilityFeatureOperator, CapabilityInstallState } from '../../utils/types';
import { CAPABILITY_INSTALL_STATE_CONFIG } from '../../utils/constants';
import OperatorPackageLink from '../OperatorPackageLink/OperatorPackageLink';

type CapabilityCardActionsProps = {
  installState: CapabilityInstallState;
  operators: CapabilityFeatureOperator[];
};

const CapabilityCardActions: FC<CapabilityCardActionsProps> = ({ installState, operators }) => {
  const { t } = useKubevirtTranslation();
  const { detailsMap } = useCapabilitiesData();
  const { isInstalling } = useCapabilitiesActions();
  const { color, getLabel } = CAPABILITY_INSTALL_STATE_CONFIG[installState];

  return (
    <Split hasGutter>
      <SplitItem>
        {isInstalling ? (
          <Skeleton width="80px" />
        ) : (
          <Label color={color} isCompact>
            {getLabel(t)}
          </Label>
        )}
      </SplitItem>
      <SplitItem>
        <HelpTextIcon
          bodyContent={
            <Stack>
              {operators.map(({ displayName, packageName }) => (
                <StackItem key={packageName}>
                  <OperatorPackageLink
                    displayName={displayName}
                    operatorHubURL={detailsMap[packageName]?.operatorHubURL}
                  />
                </StackItem>
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
