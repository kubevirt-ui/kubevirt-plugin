import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { CloudInitDescription } from '@kubevirt-utils/components/CloudinitDescription/CloudInitDescription';
import CloudinitModal from '@kubevirt-utils/components/CloudinitModal/CloudinitModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type InitialRunTabCloudInitProps = {
  canUpdateVM: boolean;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const InitialRunTabCloudinit: FC<InitialRunTabCloudInitProps> = ({
  canUpdateVM,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <VirtualMachineDescriptionItem
      onEditClick={() =>
        createModal(({ isOpen, onClose }) => (
          <CloudinitModal isOpen={isOpen} onClose={onClose} onSubmit={onSubmit} vm={vm} vmi={vmi} />
        ))
      }
      descriptionData={<CloudInitDescription vm={vm} />}
      descriptionHeader={<SearchItem id="cloud-init">{t('Cloud-init')}</SearchItem>}
      isEdit={canUpdateVM}
      showEditOnTitle
    />
  );
};

export default InitialRunTabCloudinit;
