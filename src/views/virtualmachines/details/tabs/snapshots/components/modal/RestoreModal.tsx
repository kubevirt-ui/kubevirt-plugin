import * as React from 'react';

import VirtualMachineRestoreModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineRestoreModel';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { getVMRestoreSnapshotResource } from '../../utils/helpers';

type DeleteResourceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  snapshot: V1alpha1VirtualMachineSnapshot;
};

const RestoreModal: React.FC<DeleteResourceModalProps> = ({ isOpen, onClose, snapshot }) => {
  const { t } = useKubevirtTranslation();

  const resultRestore = React.useMemo(() => {
    const restore: V1alpha1VirtualMachineRestore = getVMRestoreSnapshotResource(snapshot);
    return restore;
  }, [snapshot]);

  return (
    <TabModal<V1alpha1VirtualMachineRestore>
      onSubmit={(obj) =>
        k8sCreate({
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
      {t('Are you sure you want to restore {{name}}?', {
        name: snapshot.metadata.name,
      })}
    </TabModal>
  );
};

export default RestoreModal;
