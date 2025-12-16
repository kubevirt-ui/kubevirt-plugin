import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { DataVolumeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type BootableVolumeAddButtonProps = {
  buttonText?: string;
  namespace: string;
};

const BootableVolumeAddButton: FC<BootableVolumeAddButtonProps> = ({ buttonText, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();
  const isACMPage = useIsACMPage();
  const clusters = useListClusters();
  const [hubClusterName] = useHubClusterName();
  const selectedCluster = clusters?.[0] || hubClusterName;
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const { canCreateDS, canCreatePVC, canListInstanceTypesPreference } =
    useCanCreateBootableVolume(namespace);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? createModal((props) => <AddBootableVolumeModal {...props} />)
      : navigate(
          isACMPage
            ? `/k8s/cluster/${selectedCluster}/ns/${selectedNamespace}/${DataVolumeModelRef}/~new`
            : `/k8s/ns/${selectedNamespace}/${DataVolumeModelRef}/~new`,
        );
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
