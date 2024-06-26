import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

type BootableVolumeAddButtonProps = {
  buttonText?: string;
  namespace: string;
};

const BootableVolumeAddButton: FC<BootableVolumeAddButtonProps> = ({ buttonText, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const { canCreateDS, canCreatePVC, canListInstanceTypesPreference } =
    useCanCreateBootableVolume(namespace);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? createModal((props) => <AddBootableVolumeModal {...props} />)
      : navigate(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/~new`);
  };

  if ((canCreateDS || canCreatePVC) && canListInstanceTypesPreference) {
    return (
      <ListPageCreateDropdown items={createItems} onClick={onCreate}>
        {buttonText || t('Add volume')}
      </ListPageCreateDropdown>
    );
  }

  return <></>;
};

export default BootableVolumeAddButton;
