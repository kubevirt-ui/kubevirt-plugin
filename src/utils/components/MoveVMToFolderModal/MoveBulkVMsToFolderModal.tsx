import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import { isValidFolderName } from '@kubevirt-utils/components/FolderSelect/utils/validation';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';

import BulkVmsMoveGroupSummary from './components/BulkVmsMoveGroupSummary';
import useRemoveFolderQuery from './hooks/useRemoveFolderQuery';
import SelectedFolderIndicator from './SelectedFolderIndicator';
import {
  getBulkInitialFolderName,
  getBulkSourceGroupDisplayName,
  getFolderDisplayName,
  getMoveToFolderSubmitDisabledTooltip,
  hasFolderDestinationChanged,
} from './utils';

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
  const initialFolderName = useMemo(() => getBulkInitialFolderName(vms), [vms]);
  const [folderName, setFolderName] = useState<string>(() => initialFolderName);

  const namespace = getNamespace(vms?.[0]);
  const destinationGroupName = getFolderDisplayName(folderName, t);
  const sourceGroupName = getBulkSourceGroupDisplayName(vms, t);

  const removeFolderQuery = useRemoveFolderQuery(vms);
  const hasDestinationChanged = hasFolderDestinationChanged(initialFolderName, folderName);
  const isSubmitDisabled = !hasDestinationChanged || !isValidFolderName(folderName);
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
          <BulkVmsMoveGroupSummary
            destinationGroupName={destinationGroupName}
            hasDestinationChanged={hasDestinationChanged}
            namespace={namespace}
            sourceGroupName={sourceGroupName}
            vms={vms}
          />
        </StackItem>
        <StackItem>
          <FolderSelect
            cluster={getCluster(vms?.[0])}
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
