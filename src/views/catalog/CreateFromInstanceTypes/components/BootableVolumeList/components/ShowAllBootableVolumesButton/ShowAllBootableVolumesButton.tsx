import React, { FC } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, SplitItem } from '@patternfly/react-core';

import BootableVolumeListModal from '../BootableVolumeListModal/BootableVolumeListModal';

const ShowAllBootableVolumesButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <SplitItem className="bootable-volume-list-bar__show-all-btn">
      <Button
        onClick={() => createModal((props) => <BootableVolumeListModal {...props} />)}
        variant={ButtonVariant.link}
      >
        {t('Show all')}
      </Button>
    </SplitItem>
  );
};

export default ShowAllBootableVolumesButton;
