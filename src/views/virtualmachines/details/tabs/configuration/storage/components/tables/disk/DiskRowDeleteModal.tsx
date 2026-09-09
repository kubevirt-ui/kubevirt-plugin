// Extracted from DiskRowActions.tsx
// Root: src/views/virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskRowActions.tsx

import React, { type FC } from 'react';

import { type V1VirtualMachine, type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant } from '@patternfly/react-core';

import DeleteDiskModal from '../../modal/DeleteDiskModal';
import DetachModal from '../../modal/DetachModal';

type DiskRowDeleteModalProps = {
  customize: boolean;
  diskName: string;
  isCDROM: boolean;
  isHotplug: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCustomizeDeleteDisk: () => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  volume: undefined | V1Volume;
};

const DiskRowDeleteModal: FC<DiskRowDeleteModalProps> = ({
  customize,
  diskName,
  isCDROM,
  isHotplug,
  isOpen,
  onClose,
  onCustomizeDeleteDisk,
  vm,
  volume,
}) => {
  const { t } = useKubevirtTranslation();

  if (customize || isCDROM) {
    return (
      <DetachModal
        diskName={diskName}
        headerText={t('Detach disk?')}
        isOpen={isOpen}
        obj={vm}
        onClose={onClose}
        onSubmit={onCustomizeDeleteDisk}
        submitBtnText={t('Detach')}
        submitBtnVariant={ButtonVariant.danger}
      />
    );
  }

  return (
    <DeleteDiskModal
      isHotPluginVolume={isHotplug}
      isOpen={isOpen}
      onClose={onClose}
      vm={vm}
      volume={volume}
    />
  );
};

export default DiskRowDeleteModal;
