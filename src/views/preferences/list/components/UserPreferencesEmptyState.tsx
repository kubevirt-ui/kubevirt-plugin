import type { FC } from 'react';

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
      bodyContent={t('To get started, create a VirtualMachinePreference.')}
      buttonAction={
        <PreferenceCreateButton
          buttonText={t('Create VirtualMachinePreference')}
          namespace={namespace}
        />
      }
      titleText={t("You don't have any VirtualMachinePreferences yet")}
    />
  );
};

export default UserPreferencesEmptyState;
