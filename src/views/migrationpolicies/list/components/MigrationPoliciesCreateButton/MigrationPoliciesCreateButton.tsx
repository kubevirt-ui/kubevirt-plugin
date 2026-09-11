import { type FC } from 'react';
import { useNavigate } from 'react-router';
import { getMigrationPolicyURL } from 'src/views/migrationpolicies/utils/utils';

import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import MigrationPolicyCreateModal from '../../../components/MigrationPolicyCreateModal/MigrationPolicyCreateModal';

const MigrationPoliciesCreateButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const selectedCluster = useSelectedCluster();
  const navigate = useNavigate();
  const { createModal } = useModal();

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const canCreateMigrationPolicy = useCanCreateResource({
    cluster: selectedCluster,
    model: MigrationPolicyModel,
  });

  const onCreate = (type: string): void => {
    if (type === 'form') {
      return createModal?.(({ isOpen, onClose }) => (
        <MigrationPolicyCreateModal isOpen={isOpen} onClose={onClose} />
      ));
    }
    navigate(getMigrationPolicyURL('~new', selectedCluster));
  };

  const createButtonText = t('Create MigrationPolicy');

  if (!canCreateMigrationPolicy) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return (
    <ListPageCreateDropdown items={createItems} onClick={onCreate}>
      {createButtonText}
    </ListPageCreateDropdown>
  );
};

export default MigrationPoliciesCreateButton;
