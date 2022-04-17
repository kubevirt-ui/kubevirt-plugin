import * as React from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeleteResourceMessage from '@kubevirt-utils/components/DeleteResourceMessage/DeleteResourceMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant } from '@patternfly/react-core';

const SnapshotDeleteModal = ({ isOpen, onClose, snapshot }) => {
  const { t } = useKubevirtTranslation();
  return (
    <TabModal<V1alpha1VirtualMachineSnapshot>
      onClose={onClose}
      isOpen={isOpen}
      obj={snapshot}
      onSubmit={(obj) =>
        k8sDelete({
          model: VirtualMachineSnapshotModel,
          resource: obj,
          json: undefined,
          requestInit: undefined,
        })
      }
      headerText={t('Delete VirtualMachineSnapshot')}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <DeleteResourceMessage obj={snapshot} />
    </TabModal>
  );
};

export default SnapshotDeleteModal;
