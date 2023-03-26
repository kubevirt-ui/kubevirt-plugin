import React, { FC, useEffect, useState } from 'react';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty, isUpstream } from '@kubevirt-utils/utils/utils';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';

import AddBootableVolumeModal from '../AddBootableVolumeModal/AddBootableVolumeModal';

export type AddBootableVolumeButtonProps = {
  preferencesNames: string[];
  loadError?: any;
  buttonVariant?: ButtonVariant;
  onSelectCreatedVolume?: (
    selectedVolume: V1beta1DataSource,
    pvcSource: V1alpha1PersistentVolumeClaim,
  ) => void;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  loadError,
  buttonVariant,
  onSelectCreatedVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [canCreateVolume] = useAccessReview({
    resource: DataSourceModel.plural,
    verb: 'create' as K8sVerb,
    namespace: isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS,
    group: DataSourceModel.apiGroup,
  });

  useEffect(() => {
    isEmpty(preferences) &&
      setPreferences((prevPreferences) => {
        prevPreferences.push(...preferencesNames);
        return prevPreferences;
      });
  }, [preferences, preferencesNames]);

  return (
    <Button
      onClick={() =>
        createModal(({ isOpen, onClose }) => (
          <AddBootableVolumeModal
            isOpen={isOpen}
            onClose={onClose}
            preferencesNames={preferences}
            onSelectCreatedVolume={onSelectCreatedVolume}
          />
        ))
      }
      variant={buttonVariant || ButtonVariant.secondary}
      isDisabled={loadError || !canCreateVolume}
    >
      {t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeButton;
