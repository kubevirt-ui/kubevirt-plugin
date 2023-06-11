import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  GreenCheckCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Flex, FlexItem, Skeleton, Title } from '@patternfly/react-core';

import usePermissions from './hooks/usePermissions';

import './permissions-tab.scss';

const PermissionsTab = () => {
  const { t } = useKubevirtTranslation();
  const { capabilitiesData, isLoading } = usePermissions();
  return (
    <div className="permissions-tab--main">
      <Flex>
        <FlexItem>
          <Title headingLevel="h6" size="md">
            {t('Tasks')}
          </Title>
        </FlexItem>
        <FlexItem align={{ default: 'alignRight' }}>
          <Title headingLevel="h6" size="md">
            {t('Permissions')}
          </Title>
        </FlexItem>
      </Flex>
      <Divider className="permissions-tab--main__divider" />
      {!isLoading ? (
        capabilitiesData?.map(({ allowed, taskName }) => (
          <Flex className="permissions-tab--main__row" key={taskName}>
            <FlexItem>{taskName}</FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              {allowed ? <GreenCheckCircleIcon /> : <YellowExclamationTriangleIcon />}
            </FlexItem>
          </Flex>
        ))
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

export default PermissionsTab;
