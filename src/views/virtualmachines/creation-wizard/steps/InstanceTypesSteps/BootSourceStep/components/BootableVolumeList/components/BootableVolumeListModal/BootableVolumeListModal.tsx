import React, { FC } from 'react';

import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ModalVariant } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/creation-wizard/utils/types';

import BootableVolumeList from '../../BootableVolumeList';

type BootableVolumeListModalProps = {
  bootableVolumesData: UseBootableVolumesValues;
  favorites: UserSettingFavorites;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedBootableVolume: BootableVolume) => void;
  preferencesData: UseInstanceTypeAndPreferencesValues;
  userPreferencesData: V1beta1VirtualMachinePreference[];
};

const BootableVolumeListModal: FC<BootableVolumeListModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  preferencesData,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    instanceTypeFlowState: { selectedBootableVolume },
  } = useVMWizardStore();

  const onSave = () => {
    if (!selectedBootableVolume) {
      return Promise.resolve();
    }
    onSelect(selectedBootableVolume);
    onClose();

    return Promise.resolve();
  };

  return (
    <TabModal
      headerText={t('Available volumes')}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      onClose={onClose}
      onSubmit={onSave}
      submitBtnText={t('Select')}
    >
      <BootableVolumeList instanceTypesAndPreferencesData={preferencesData} />
    </TabModal>
  );
};

export default BootableVolumeListModal;
