import * as React from 'react';

import {
  GreenCheckCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardHeader, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { usePermissionsCardPermissions } from './hooks/useOverviewPermissions';
import { PermissionsCardPopover } from './utils/PermissionsCardPopover';
import { PermissionsCountItem } from './utils/PermissionsCountItem';
import PermissionsCardTitle from './PermissionsCardTitle';

import './PermissionsCard.scss';

const PermissionsCard: React.FC = () => {
  const permissionsData = usePermissionsCardPermissions();
  const {
    capabilitiesData,
    permissionsLoading,
    numAllowedCapabilities,
    numNotAllowedCapabilities,
  } = permissionsData;

  return (
    <Card data-test-id="kv-overview-permissions-card">
      <CardHeader>
        <CardTitle>
          <PermissionsCardTitle />
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className="kv-permissions-card__status">
          <PermissionsCardPopover capabilitiesData={capabilitiesData} />
          <Flex direction={{ default: 'row' }}>
            <FlexItem>
              <PermissionsCountItem
                count={numAllowedCapabilities}
                Icon={GreenCheckCircleIcon}
                isLoading={permissionsLoading}
              />
            </FlexItem>
            <FlexItem>
              <PermissionsCountItem
                count={numNotAllowedCapabilities}
                Icon={YellowExclamationTriangleIcon}
                isLoading={permissionsLoading}
              />
            </FlexItem>
          </Flex>
        </div>
      </CardBody>
    </Card>
  );
};

export default PermissionsCard;
