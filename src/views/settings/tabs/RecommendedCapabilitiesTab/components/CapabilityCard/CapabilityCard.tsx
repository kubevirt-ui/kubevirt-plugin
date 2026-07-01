import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Label,
  Skeleton,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useRecommendedCapabilitiesContext } from '../../context/RecommendedCapabilitiesContext';
import { CapabilityFeature } from '../../utils/types';
import {
  CAPABILITY_INSTALL_STATE_LABEL_COLOR,
  getCapabilityInstallStateLabel,
} from '../../utils/utils';

type CapabilityCardProps = {
  feature: CapabilityFeature;
};

const CapabilityCard: FC<CapabilityCardProps> = ({ feature }) => {
  const { t } = useKubevirtTranslation();
  const { getCapabilityInstallState, resourcesLoaded } = useRecommendedCapabilitiesContext();
  const installState = getCapabilityInstallState(feature);

  const operatorsPopoverBody = (
    <Stack>
      {feature.operators.map((operator) => (
        <StackItem key={operator.packageName}>{operator.packageName}</StackItem>
      ))}
    </Stack>
  );

  return (
    <Card isFullHeight>
      <CardHeader
        actions={{
          actions: resourcesLoaded ? (
            <Split hasGutter>
              <SplitItem>
                <Label color={CAPABILITY_INSTALL_STATE_LABEL_COLOR[installState]} isCompact>
                  {getCapabilityInstallStateLabel(installState, t)}
                </Label>
              </SplitItem>
              <SplitItem>
                <HelpTextIcon
                  bodyContent={operatorsPopoverBody}
                  headerContent={t('Included operators')}
                />
              </SplitItem>
            </Split>
          ) : (
            <Skeleton width="80px" />
          ),
        }}
      >
        <CardTitle>{feature.title}</CardTitle>
      </CardHeader>
      <CardBody>{feature.description}</CardBody>
    </Card>
  );
};

export default CapabilityCard;
