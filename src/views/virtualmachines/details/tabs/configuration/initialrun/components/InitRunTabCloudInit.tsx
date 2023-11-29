import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import { CloudinitModal } from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type InitRunTabCloudInitProps = {
  canUpdateVM: boolean;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  resource: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const InitRunTabCloudinit: FC<InitRunTabCloudInitProps> = ({
  canUpdateVM,
  onSubmit,
  resource,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  return (
    <>
      <VirtualMachineDescriptionItem
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <CloudinitModal
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={onSubmit}
              vm={resource}
              vmi={vmi}
            />
          ))
        }
        descriptionData={<CloudInitDescription vm={resource} />}
        descriptionHeader={t('Cloud-init')}
        isEdit={canUpdateVM}
        showEditOnTitle
      />
    </>
  );
};

export default InitRunTabCloudinit;
