import React, { type FC } from 'react';
import { useNavigate } from 'react-router';

import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import { VM_NETWORKS_PATH } from '../../constants';
import useCanCreateVMNetwork from '../../hooks/useCanCreateVMNetwork';

const CreateNetworkButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const { canCreate } = useCanCreateVMNetwork();

  const onCreate = (): void => {
    navigate(`${VM_NETWORKS_PATH}/~new`);
  };

  const createButtonText = t('Create network');

  if (!canCreate) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return <Button onClick={onCreate}>{createButtonText}</Button>;
};

export default CreateNetworkButton;
