import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';
import {
  GreenCheckCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Divider, Flex, FlexItem, Skeleton, Title } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const TaskPermissionsSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { capabilitiesData, isLoading } = usePermissions();
  return (
    <ExpandSection className="permissions-tab--main" toggleText={t('Permissions')}>
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
        Object.values(capabilitiesData)?.map(({ allowed, taskName }) => (
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
    </ExpandSection>
  );
};

export default TaskPermissionsSection;
