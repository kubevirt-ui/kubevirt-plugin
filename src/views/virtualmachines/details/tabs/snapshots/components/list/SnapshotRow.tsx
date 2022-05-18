import * as React from 'react';

import { VirtualMachineSnapshotModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Tooltip } from '@patternfly/react-core';

import { snapshotStatuses } from '../../utils/consts';
import IndicationLabelList from '../IndicationLabel/IndicationLabelList';
import RestoreModal from '../modal/RestoreModal';

import SnapshotActionsMenu from './SnapshotActionsMenu';

const SnapshotRow: React.FC<
  RowProps<
    V1alpha1VirtualMachineSnapshot,
    { restores: Map<string, V1alpha1VirtualMachineRestore>; isVMRunning: boolean }
  >
> = ({ obj: snapshot, activeColumnIDs, rowData: { restores, isVMRunning } }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const relevantRestore: V1alpha1VirtualMachineRestore = restores?.[snapshot?.metadata?.name];
  const snapshotStatus = snapshot?.status?.phase;
  const isRestoreDisabled = isVMRunning || snapshotStatus !== snapshotStatuses.Succeeded;
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
          name={snapshot?.metadata?.name}
          namespace={snapshot?.metadata?.namespace}
        />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        {snapshotStatus}
      </TableData>
      <TableData id="last-restored" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData id="indications" activeColumnIDs={activeColumnIDs}>
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData id="restore-snapshot" activeColumnIDs={activeColumnIDs}>
        <Tooltip content={t('Restore is enabled only for offline VirtualMachine.')}>
          <Button
            isAriaDisabled={isRestoreDisabled}
            variant="secondary"
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
                <RestoreModal snapshot={snapshot} isOpen={isOpen} onClose={onClose} />
              ))
            }
          >
            {t('Restore')}
          </Button>
        </Tooltip>
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <SnapshotActionsMenu snapshot={snapshot} />
      </TableData>
    </>
  );
};

export default SnapshotRow;
