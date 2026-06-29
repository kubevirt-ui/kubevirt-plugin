import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import AddBootableVolumeModal from '@kubevirt-utils/components/AddBootableVolumeModal/AddBootableVolumeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useCanCreateBootableVolume from '@kubevirt-utils/resources/bootableresources/hooks/useCanCreateBootableVolume';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { applySelectedBootableVolumeToForm } from '@virtualmachines/creation-wizard-new/utils/utils';

import './AddBootableVolumeLink.scss';

type AddBootableVolumeLinkProps = {
  hidePopover?: () => void;
  loadError?: Error;
  text?: string;
};

const AddBootableVolumeLink: FC<AddBootableVolumeLinkProps> = ({
  hidePopover,
  loadError,
  text,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { control, getValues, setValue } = useVMWizard();
  const [volumeListNamespace, preference] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.VOLUME_LIST_NAMESPACE,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
    ],
  });

  const { canCreateDS, canCreatePVC } = useCanCreateBootableVolume(volumeListNamespace);
  const canCreate = canCreateDS || canCreatePVC;

  return (
    <Button
      onClick={() => {
        hidePopover?.();
        createModal((props) => (
          <AddBootableVolumeModal
            onCreateVolume={(volume) =>
              applySelectedBootableVolumeToForm({
                dvSource: null,
                getValues,
                pvcSource: null,
                selectedVolume: volume,
                setValue,
                volumeSnapshotSource: null,
              })
            }
            lockedPreference={preference ?? undefined}
            {...props}
          />
        ));
      }}
      className="add-bootable-volume-link__inline-text"
      data-test-id="add-volume-button-under-list"
      isDisabled={!!loadError || !canCreate}
      isInline
      variant={ButtonVariant.link}
    >
      {text || t('Add volume')}
    </Button>
  );
};

export default AddBootableVolumeLink;
