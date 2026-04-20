import React, { FCC } from 'react';

import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ModalVariant } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
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

const BootableVolumeListModal: FCC<BootableVolumeListModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  preferencesData,
}) => {
  const { t } = useKubevirtTranslation();
  const { selectedBootableVolume, volumeListNamespace } = useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);

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
      <BootableVolumeList
        bootableVolumesData={bootableVolumesData}
        instanceTypesAndPreferencesData={preferencesData}
      />
    </TabModal>
  );
};

export default BootableVolumeListModal;
