import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Stack, StackItem } from '@patternfly/react-core';
import { FolderIcon } from '@patternfly/react-icons';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

type MoveVMToFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const MoveVMToFolderModal: FC<MoveVMToFolderModalProps> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const [folderName, setFolderName] = useState<string>(getLabel(vm, VM_FOLDER_LABEL));

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Move to folder')}
      isDisabled={!folderName}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(folderName)}
      submitBtnText={t('Save')}
    >
      <Stack hasGutter>
        <StackItem>
          <Trans t={t}>
            Move <b>{getName(vm)}</b> VirtualMachine to folder
          </Trans>
        </StackItem>
        <StackItem>
          <FolderSelect
            isFullWidth
            namespace={getNamespace(vm)}
            selectedFolder={folderName}
            setSelectedFolder={setFolderName}
          />
        </StackItem>
        {folderName && (
          <StackItem>
            <FolderIcon />
            <span className="pf-v6-u-ml-sm">{folderName}</span>
          </StackItem>
        )}
      </Stack>
    </TabModal>
  );
};

export default MoveVMToFolderModal;
