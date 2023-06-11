import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isUpstream } from '@kubevirt-utils/utils/utils';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';

export type AddBootableVolumeButtonProps = {
  buttonVariant?: ButtonVariant;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({ buttonVariant }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [canCreateVolume] = useAccessReview({
    group: DataSourceModel.apiGroup,
    namespace: isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS,
    resource: DataSourceModel.plural,
    verb: 'create' as K8sVerb,
  });
  const { instanceTypesAndPreferencesData, onSelectCreatedVolume } = useInstanceTypeVMStore();
  const { loadError } = instanceTypesAndPreferencesData;

  return (
    <Button
      onClick={() =>
        createModal((props) => (
          <AddBootableVolumeModal onCreateVolume={onSelectCreatedVolume} {...props} />
        ))
      }
      isDisabled={loadError || !canCreateVolume}
      variant={buttonVariant || ButtonVariant.secondary}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
