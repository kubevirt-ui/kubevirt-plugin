import React, { type FC } from 'react';
import { useNavigate } from 'react-router';

import { DataSourceModel, DataSourceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import { CreateDataSourceModal } from '../../CreateDataSourceModal/CreateDataSourceModal';

type DataSourceCreateButtonProps = {
  namespace: string;
};

const DataSourceCreateButton: FC<DataSourceCreateButtonProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const canCreateDataSource = useCanCreateResource({
    model: DataSourceModel,
    namespace,
  });

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string): void => {
    if (type === 'form') {
      createModal?.((props) => <CreateDataSourceModal namespace={namespace} {...props} />);
      return;
    }

    navigate(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/~new`);
  };

  const createButtonText = t('Create DataSource');

  if (!canCreateDataSource) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return (
    <ListPageCreateDropdown items={createItems} onClick={onCreate}>
      {createButtonText}
    </ListPageCreateDropdown>
  );
};

export default DataSourceCreateButton;
