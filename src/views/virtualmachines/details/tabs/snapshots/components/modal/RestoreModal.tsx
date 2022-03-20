import * as React from 'react';

import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/components/node_modules/@kubevirt-ui/kubevirt-api/kubevirt';
import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import { V1alpha1VirtualMachineRestore } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { getVMRestoreSnapshotResource } from '../../utils/helpers';

type DeleteResourceModalProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
  onClose: () => void;
  isOpen: boolean;
};

const RestoreModal: React.FC<DeleteResourceModalProps> = ({ snapshot, onClose, isOpen }) => {
  const { t } = useKubevirtTranslation();

  const resultRestore = React.useMemo(() => {
    const restore: V1alpha1VirtualMachineRestore = getVMRestoreSnapshotResource(snapshot);
    return restore;
  }, [snapshot]);

  return (
    <TabModal<V1alpha1VirtualMachineRestore>
      isOpen={isOpen}
      obj={resultRestore}
      onSubmit={(obj) =>
        k8sCreate({
          model: VirtualMachineRestoreModel,
          data: obj,
        })
      }
      onClose={onClose}
      headerText={t('Restore Snapshot')}
      submitBtnText={t('Restore')}
    >
      {t('Are you sure you want to restore {{name}}?', {
        name: snapshot.metadata.name,
      })}
    </TabModal>
  );
};

export default RestoreModal;
