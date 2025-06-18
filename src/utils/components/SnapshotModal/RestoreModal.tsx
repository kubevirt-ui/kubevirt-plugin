import React, { FC, useMemo } from 'react';
import { Trans } from 'react-i18next';

import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { fleetK8sCreate } from '@stolostron/multicluster-sdk';

import { getVMRestoreSnapshotResource } from '../../../views/virtualmachines/details/tabs/snapshots/utils/helpers';

import './restore-modal.scss';

type DeleteResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  snapshot: V1beta1VirtualMachineSnapshot;
};

const RestoreModal: FC<DeleteResourceModalProps> = ({ isOpen, onClose, snapshot }) => {
  const { t } = useKubevirtTranslation();

  const resultRestore = useMemo(() => {
    const restore: V1beta1VirtualMachineRestore = getVMRestoreSnapshotResource(snapshot);
    return restore;
  }, [snapshot]);

  return (
    <TabModal<V1beta1VirtualMachineRestore>
      onSubmit={(obj) =>
        fleetK8sCreate({
          cluster: snapshot?.cluster,
          data: obj,
          model: VirtualMachineRestoreModel,
        })
      }
      headerText={t('Restore snapshot')}
      isOpen={isOpen}
      obj={resultRestore}
      onClose={onClose}
      submitBtnText={t('Restore')}
    >
      <Trans t={t}>
        Are you sure you want to restore {{ vmName: snapshot?.spec?.source?.name }} from snapshot{' '}
        {{ snapshotName: snapshot.metadata.name }}?
        <div className="RestoreModal--note_text">
          <b>Note: </b>
          Data from the last snapshot taken will be lost. To prevent losing current data, take
          another snapshot before restoring from this one.
        </div>
      </Trans>
    </TabModal>
  );
};

export default RestoreModal;
