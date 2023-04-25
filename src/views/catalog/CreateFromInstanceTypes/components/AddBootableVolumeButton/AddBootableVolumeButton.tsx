import React, { FC, useEffect, useState } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
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
  onSelectVolume?: (selectedVolume: BootableVolume) => void;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  loadError,
  buttonVariant,
  onSelectVolume,
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
            onSelectVolume={onSelectVolume}
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
