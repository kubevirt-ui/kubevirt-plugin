import * as React from 'react';
import { useHistory } from 'react-router-dom';

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
    const history = useHistory();

    return (
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={headerText || t('Delete Resource?')}
        onSubmit={() => {
          return onDeleteSubmit().then(() => {
            const pathname = history?.location?.pathname;
            return (
              pathname?.includes(obj?.metadata?.name) &&
              history.push(pathname.replace(obj?.metadata?.name, ''))
            );
          });
        }}
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
