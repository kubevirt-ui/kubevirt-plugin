import { type FC } from 'react';

import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import AddBootableVolumeWizard from '@kubevirt-utils/components/AddBootableVolumeWizard/AddBootableVolumeWizard';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { Button, ButtonVariant, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { getCreateBootSourcesPermissionDeniedMessage } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';

import { CHANGE_BOOT_SOURCE_ADD_VOLUME_TEST_ID } from '../utils/consts';

type AddBootableVolumeButtonProps = {
  canCreate: boolean;
  cluster?: string;
  lockedPreference?: PreferenceOption;
  namespace?: string;
  onCreateVolume: (volume: BootableVolume) => void;
};

const AddBootableVolumeButton: FC<AddBootableVolumeButtonProps> = ({
  canCreate,
  cluster,
  lockedPreference,
  namespace,
  onCreateVolume,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const openAddBootableVolumeWizard = (): void => {
    createModal(({ onClose }) => (
      <AddBootableVolumeWizard
        initialValues={{ cluster, lockedPreference, namespace }}
        onClose={onClose}
        onCreateVolume={onCreateVolume}
      />
    ));
  };

  return (
    <Flex className="pf-v6-u-mb-md" justifyContent={{ default: 'justifyContentFlexEnd' }}>
      <FlexItem>
        <Tooltip
          content={getCreateBootSourcesPermissionDeniedMessage(t)}
          trigger={canCreate ? '' : 'mouseenter focus'}
        >
          <Button
            data-test={CHANGE_BOOT_SOURCE_ADD_VOLUME_TEST_ID}
            isAriaDisabled={!canCreate}
            onClick={() => {
              if (!canCreate) {
                return;
              }
              openAddBootableVolumeWizard();
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
