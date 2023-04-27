import React, { FC, useEffect, useState } from 'react';

import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';

import AddBootableVolumeModal from '../AddBootableVolumeModal/AddBootableVolumeModal';

export type AddBootableVolumeButtonProps = {
  preferencesNames: string[];
  loadError?: any;
  buttonVariant?: ButtonVariant;
  onSelectVolume?: (selectedVolume: BootableVolume) => void;
  volumeNamespace?: string;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  preferencesNames,
  loadError,
  buttonVariant,
  onSelectVolume,
  volumeNamespace,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [canCreateVolume] = useAccessReview({
    resource: DataSourceModel.plural,
    verb: 'create' as K8sVerb,
    namespace: volumeNamespace,
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
            volumeNamespace={volumeNamespace}
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
