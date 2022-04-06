import * as React from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant } from '@patternfly/react-core';

import DeleteResourceMessage from '../DeleteResourceMessage/DeleteResourceMessage';

type DeleteModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onDeleteSubmit: () => Promise<void | K8sResourceCommon>;
  onClose: () => void;
  headerText?: string;
};

const DeleteModal: React.FC<DeleteModalProps> = React.memo(
  ({ isOpen, obj, onDeleteSubmit, onClose, headerText }) => {
    const { t } = useKubevirtTranslation();

    return (
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={headerText || t('Delete Resource?')}
        onSubmit={onDeleteSubmit}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
        titleIconVariant={'warning'}
      >
        <DeleteResourceMessage obj={obj} />
      </TabModal>
    );
  },
);

export default DeleteModal;
