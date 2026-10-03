import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Trans } from 'react-i18next';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import { isValidFolderName } from '@kubevirt-utils/components/FolderSelect/utils/validation';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { Stack, StackItem } from '@patternfly/react-core';

import VmCountPopoverLink from './components/VmCountPopoverLink';
import useRemoveFolderQuery from './hooks/useRemoveFolderQuery';
import SelectedFolderIndicator from './SelectedFolderIndicator';
import {
  getBulkInitialFolderName,
  getBulkSharedFolderName,
  getBulkVmsMoveGroupSummaryChangePhrase,
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
  const hasSharedSourceFolder = getBulkSharedFolderName(vms) !== null;

  const removeFolderQuery = useRemoveFolderQuery(vms);
  const hasDestinationChanged = hasFolderDestinationChanged(initialFolderName, folderName);
  const isSubmitDisabled = !hasDestinationChanged || !isValidFolderName(folderName);
  const groupChangePhrase = getBulkVmsMoveGroupSummaryChangePhrase(
    t,
    hasDestinationChanged,
    hasSharedSourceFolder,
    initialFolderName,
    folderName,
  );

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Move to group')}
      isDisabled={isSubmitDisabled}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {
        removeFolderQuery?.(folderName);
        return onSubmit(folderName);
      }}
      submitDisabledTooltip={getMoveToFolderSubmitDisabledTooltip(
        folderName,
        hasDestinationChanged,
        t,
      )}
    >
      <Stack hasGutter>
        <StackItem>
          <Trans t={t}>
            Move <VmCountPopoverLink vms={vms} /> in namespace <strong>{{ namespace }}</strong>
          </Trans>
          {groupChangePhrase ? ` ${groupChangePhrase}` : null}
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
