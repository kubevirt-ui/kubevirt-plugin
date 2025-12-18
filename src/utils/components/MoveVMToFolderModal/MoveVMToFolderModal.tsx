import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import useRemoveFolderQuery from './hooks/useRemoveFolderQuery';
import SelectedFolderIndicator from './SelectedFolderIndicator';

type MoveVMToFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const MoveVMToFolderModal: FC<MoveVMToFolderModalProps> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const [folderName, setFolderName] = useState<string>(getLabel(vm, VM_FOLDER_LABEL));

  const removeFolderQuery = useRemoveFolderQuery([vm]);

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
          <Trans t={t}>
            Move <b>{getName(vm)}</b> VirtualMachine to folder
          </Trans>
        </StackItem>
        <StackItem>
          <FolderSelect
            cluster={getCluster(vm)}
            isFullWidth
            namespace={getNamespace(vm)}
            selectedFolder={folderName}
            setSelectedFolder={setFolderName}
          />
        </StackItem>
        <SelectedFolderIndicator folderName={folderName} />
      </Stack>
    </TabModal>
  );
};

export default MoveVMToFolderModal;
