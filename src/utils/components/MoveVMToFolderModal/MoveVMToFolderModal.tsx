import { type FC, useMemo, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import { isValidFolderName } from '@kubevirt-utils/components/FolderSelect/utils/validation';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';

import useRemoveFolderQuery from './hooks/useRemoveFolderQuery';
import SelectedFolderIndicator from './SelectedFolderIndicator';
import {
  getInitialFolderName,
  getMoveToFolderSubmitDisabledTooltip,
  getSingleVmMoveGroupSummary,
  hasFolderDestinationChanged,
} from './utils';

type MoveVMToFolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (folderName: string) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const MoveVMToFolderModal: FC<MoveVMToFolderModalProps> = ({ isOpen, onClose, onSubmit, vm }) => {
  const { t } = useKubevirtTranslation();
  const initialFolderName = useMemo(() => getInitialFolderName(vm), [vm]);
  const [folderName, setFolderName] = useState<string>(() => initialFolderName);

  const removeFolderQuery = useRemoveFolderQuery([vm]);
  const hasDestinationChanged = hasFolderDestinationChanged(initialFolderName, folderName);
  const isSubmitDisabled = !hasDestinationChanged || !isValidFolderName(folderName);
  const namespace = getNamespace(vm);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Move to group')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {
        removeFolderQuery?.(folderName);
        return onSubmit(folderName).catch((error) => {
          setFolderName(initialFolderName);
          throw error;
        });
      }}
      submitDisabledTooltip={getMoveToFolderSubmitDisabledTooltip(
        folderName,
        hasDestinationChanged,
        t,
      )}
    >
      <Stack hasGutter>
        <StackItem>
          {getSingleVmMoveGroupSummary(
            t,
            getName(vm),
            namespace,
            hasDestinationChanged,
            initialFolderName,
            folderName,
          )}
        </StackItem>
        <StackItem>
          <FolderSelect
            cluster={getCluster(vm)}
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

export default MoveVMToFolderModal;
