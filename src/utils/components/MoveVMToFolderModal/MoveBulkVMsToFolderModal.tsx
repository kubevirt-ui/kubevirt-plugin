import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { Popover, PopoverPosition, Stack, StackItem } from '@patternfly/react-core';

import useRemoveFolderQuery from './hooks/useRemoveFolderQuery';
import BulkVMsPopover from './BulkVMsPopover';
import SelectedFolderIndicator from './SelectedFolderIndicator';

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

  const removeFolderQuery = useRemoveFolderQuery(vms);

  return (
    <TabModal<V1VirtualMachine>
      onSubmit={() => {
        removeFolderQuery?.(folderName);
        return onSubmit(folderName);
      }}
      headerText={t('Move to folder')}
      isOpen={isOpen}
      onClose={onClose}
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
              {vms.length === 1
                ? t('1 VirtualMachine in {{namespace}} namespace?', { namespace })
                : t('{{numVMs}} VirtualMachines in {{namespace}} namespace?', {
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
        <SelectedFolderIndicator folderName={folderName} />
      </Stack>
    </TabModal>
  );
};

export default MoveBulkVMToFolderModal;
