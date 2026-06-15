import React, { FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import PreferenceCreateButton from './PreferenceCreateButton';

type UserPreferencesEmptyStateProps = {
  namespace: string;
};

const UserPreferencesEmptyState: FC<UserPreferencesEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListEmptyState
      buttonAction={
        <PreferenceCreateButton
          buttonText={t('Create VirtualMachinePreference')}
          namespace={namespace}
        />
      }
      bodyContent={t('To get started, create a VirtualMachinePreference.')}
      titleText={t("You don't have any VirtualMachinePreferences yet")}
    />
  );
};

export default UserPreferencesEmptyState;
