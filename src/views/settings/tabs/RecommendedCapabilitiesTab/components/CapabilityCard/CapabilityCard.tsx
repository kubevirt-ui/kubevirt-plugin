import React, { FC } from 'react';

import { Card, CardBody, CardHeader, CardTitle, Skeleton } from '@patternfly/react-core';

import { useRecommendedCapabilitiesContext } from '../../context/RecommendedCapabilitiesContext';
import { CapabilityFeature } from '../../utils/types';

import CapabilityCardActions from './CapabilityCardActions';

type CapabilityCardProps = {
  feature: CapabilityFeature;
};

const CapabilityCard: FC<CapabilityCardProps> = ({ feature }) => {
  const { getCapabilityInstallState, resourcesLoaded } = useRecommendedCapabilitiesContext();
  const installState = getCapabilityInstallState(feature);

  return (
    <Card isFullHeight>
      <CardHeader
        actions={{
          actions: resourcesLoaded ? (
            <CapabilityCardActions installState={installState} operators={feature.operators} />
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
