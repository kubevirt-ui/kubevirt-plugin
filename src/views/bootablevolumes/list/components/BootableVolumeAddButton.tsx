import { type FC } from 'react';
import { useNavigate } from 'react-router';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSelectedCluster from '@kubevirt-utils/hooks/useSelectedCluster';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { getFleetBootableVolumesURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

type BootableVolumeAddButtonProps = {
  namespace: string;
};

const BootableVolumeAddButton: FC<BootableVolumeAddButtonProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();
  const selectedCluster = useSelectedCluster();
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const { canCreateDS, canCreatePVC, canListInstanceTypesPreference } =
    useCanCreateBootableVolume(namespace);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string): void => {
    if (type === 'form') {
      createModal?.((props) => <AddBootableVolumeModal {...props} />);
      return;
    }
    const url = isACMPage
      ? `${getFleetBootableVolumesURL(selectedCluster, selectedNamespace)}/~new`
      : `/k8s/ns/${selectedNamespace}/bootablevolumes/~new`;
    navigate(url);
  };

  const createButtonText = t('Add volume');

  if ((canCreateDS || canCreatePVC) && canListInstanceTypesPreference) {
    return (
      <ListPageCreateDropdown items={createItems} onClick={onCreate}>
        {createButtonText}
      </ListPageCreateDropdown>
    );
  }

  return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
};

export default BootableVolumeAddButton;
