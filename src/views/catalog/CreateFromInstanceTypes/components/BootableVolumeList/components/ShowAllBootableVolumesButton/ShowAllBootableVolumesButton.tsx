import React, { FC } from 'react';

import {
  UseBootableVolumesValues,
  UseInstanceTypeAndPreferencesValues,
} from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, SplitItem } from '@patternfly/react-core';

import BootableVolumeListModal from '../BootableVolumeListModal/BootableVolumeListModal';

type ShowAllBootableVolumesButtonProps = {
  bootableVolumesData: UseBootableVolumesValues;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const ShowAllBootableVolumesButton: FC<ShowAllBootableVolumesButtonProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <SplitItem className="bootable-volume-list-bar__show-all-btn">
      <Button
        onClick={() =>
          createModal((modalProps) => <BootableVolumeListModal {...modalProps} {...props} />)
        }
        variant={ButtonVariant.link}
      >
        {t('Show all')}
      </Button>
    </SplitItem>
  );
};

export default ShowAllBootableVolumesButton;
