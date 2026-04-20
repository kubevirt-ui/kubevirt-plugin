import React, { FCC, useState } from 'react';

import { V1beta1VirtualMachinePreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Button, ButtonVariant, SplitItem } from '@patternfly/react-core';
import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/creation-wizard/utils/types';

import BootableVolumeListModal from '../BootableVolumeListModal/BootableVolumeListModal';

type ShowAllBootableVolumesButtonProps = {
  bootableVolumesData: UseBootableVolumesValues;
  favorites: UserSettingFavorites;
  onSelect: (selectedBootableVolume: BootableVolume) => void;
  preferencesData: UseInstanceTypeAndPreferencesValues;
  userPreferencesData: V1beta1VirtualMachinePreference[];
};

const ShowAllBootableVolumesButton: FCC<ShowAllBootableVolumesButtonProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SplitItem className="bootable-volume-list-bar__show-all-btn">
      <Button onClick={() => setIsOpen(true)} variant={ButtonVariant.link}>
        {t('Show all')}
      </Button>
      <BootableVolumeListModal isOpen={isOpen} onClose={() => setIsOpen(false)} {...props} />
    </SplitItem>
  );
};

export default ShowAllBootableVolumesButton;
