import React, { type FC } from 'react';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Button, ButtonVariant, Flex, FlexItem, Tooltip } from '@patternfly/react-core';

import { CHANGE_BOOT_SOURCE_ADD_VOLUME_TEST_ID } from '../utils/consts';

type AddBootableVolumeButtonProps = {
  canCreate: boolean;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  canCreate,
  lockedPreference,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const openAddBootableVolumeModal = (): void => {
    createModal((props) => (
      <AddBootableVolumeModal
        {...props}
        lockedPreference={lockedPreference}
        onClose={props.onClose}
        onCreateVolume={onCreateVolume}
      />
    ));
  };

  return (
    <Flex className="pf-v6-u-mb-md" justifyContent={{ default: 'justifyContentFlexEnd' }}>
      <FlexItem>
        <Tooltip
          content={t("You don't have permission to create boot sources")}
          trigger={canCreate ? '' : 'mouseenter focus'}
        >
          <Button
            data-test={CHANGE_BOOT_SOURCE_ADD_VOLUME_TEST_ID}
            isAriaDisabled={!canCreate}
            onClick={() => {
              if (!canCreate) {
                return;
              }
              openAddBootableVolumeModal();
            }}
            variant={ButtonVariant.secondary}
          >
            {t('Add new boot source')}
          </Button>
        </Tooltip>
      </FlexItem>
    </Flex>
  );
};

export default AddBootableVolumeButton;
