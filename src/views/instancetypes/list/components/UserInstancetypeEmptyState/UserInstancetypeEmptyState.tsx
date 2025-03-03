import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

import InstancetypeCreateButton from '../InstancetypeCreateButton/InstancetypeCreateButton';

type UserInstancetypeEmptyStateProps = {
  namespace: string;
};

const UserInstancetypeEmptyState: FC<UserInstancetypeEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      icon={AddCircleOIcon}
      titleText={<>{t('No VirtualMachineInstanceTypes found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Click <b>Create VirtualMachineInstanceType</b> to create your first
          VirtualMachineInstanceType
        </Trans>
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <InstancetypeCreateButton
            buttonText={t('Create VirtualMachineInstanceType')}
            namespace={namespace}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default UserInstancetypeEmptyState;
