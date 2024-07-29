import * as React from 'react';

import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1beta1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ConfirmActionMessage from '@kubevirt-utils/components/ConfirmActionMessage/ConfirmActionMessage';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant } from '@patternfly/react-core';

const SnapshotDeleteModal = ({ isOpen, onClose, snapshot }) => {
  const { t } = useKubevirtTranslation();
  return (
    <TabModal<V1beta1VirtualMachineSnapshot>
      onSubmit={(obj) =>
        k8sDelete({
          json: undefined,
          model: VirtualMachineSnapshotModel,
          requestInit: undefined,
          resource: obj,
        })
      }
      headerText={t('Delete VirtualMachineSnapshot?')}
      isOpen={isOpen}
      obj={snapshot}
      onClose={onClose}
      submitBtnText={t('Delete')}
      submitBtnVariant={ButtonVariant.danger}
    >
      <ConfirmActionMessage obj={snapshot} />
    </TabModal>
  );
};

export default SnapshotDeleteModal;
