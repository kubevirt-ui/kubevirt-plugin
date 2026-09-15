import type { FC } from 'react';

import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import InstancetypeCreateButton from '../InstancetypeCreateButton/InstancetypeCreateButton';

type UserInstancetypeEmptyStateProps = {
  namespace: string;
};

const UserInstancetypeEmptyState: FC<UserInstancetypeEmptyStateProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListEmptyState
      bodyContent={t('To get started, create a VirtualMachineInstanceType.')}
      buttonAction={
        <InstancetypeCreateButton
          buttonText={t('Create VirtualMachineInstanceType')}
          namespace={namespace}
        />
      }
      titleText={t("You don't have any VirtualMachineInstanceTypes yet")}
    />
  );
};

export default UserInstancetypeEmptyState;
