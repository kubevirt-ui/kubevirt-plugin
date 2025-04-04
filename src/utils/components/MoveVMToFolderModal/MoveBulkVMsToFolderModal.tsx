import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';

import BulkVMsPopover from './BulkVMsPopover';

type MoveBulkVMToFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<V1VirtualMachine[] | void>;
  vms: V1VirtualMachine[];
};

const MoveBulkVMToFolderModal: FC<MoveBulkVMToFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vms,
}) => {
  const { t } = useKubevirtTranslation();
  const [folderName, setFolderName] = useState<string>();

  const namespace = getNamespace(vms?.[0]);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Move to folder')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(folderName)}
      submitBtnText={t('Save')}
    >
      <Stack hasGutter>
        <StackItem>
          <Popover
            bodyContent={<BulkVMsPopover vms={vms} />}
            className="confirm-multiple-vm-actions-modal__popover"
            position={PopoverPosition.right}
          >
            <a>
              {t('{{numVMs}} VirtualMachines in {{namespace}} namespace?', {
                namespace,
                numVMs: vms.length,
              })}
            </a>
          </Popover>
        </StackItem>
        <StackItem>
          <FolderSelect
            isFullWidth
            namespace={namespace}
            selectedFolder={folderName}
            setSelectedFolder={setFolderName}
          />
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default MoveBulkVMToFolderModal;
