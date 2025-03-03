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

import PreferenceCreateButton from './PreferenceCreateButton';

type UserPreferencesEmptyStateProps = {
  namespace: string;
};

const UserPreferencesEmptyState: FC<UserPreferencesEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <EmptyState
      headingLevel="h4"
      icon={AddCircleOIcon}
      titleText={<>{t('No preferences found')}</>}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Click <b>Create VirtualMachinePreference</b> to create your first VirtualMachinePreference
        </Trans>
      </EmptyStateBody>

      <EmptyStateFooter>
        <EmptyStateActions>
          <PreferenceCreateButton
            buttonText={t('Create VirtualMachinePreference')}
            namespace={namespace}
          />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default UserPreferencesEmptyState;
