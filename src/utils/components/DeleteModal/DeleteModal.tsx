import React, { FC, memo, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForResource,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useK8sModel';
import { useLastNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { ButtonVariant } from '@patternfly/react-core';

import ConfirmActionMessage from '../ConfirmActionMessage/ConfirmActionMessage';

type DeleteModalProps = {
  isOpen: boolean;
  obj: K8sResourceCommon;
  onDeleteSubmit: () => Promise<void | K8sResourceCommon>;
  onClose: () => void;
  headerText?: string;
  bodyText?: string | ReactNode;
  redirectUrl?: string;
};

const DeleteModal: FC<DeleteModalProps> = memo(
  ({ isOpen, obj, onDeleteSubmit, onClose, headerText, bodyText, redirectUrl }) => {
    const { t } = useKubevirtTranslation();
    const history = useHistory();

    const [model] = useK8sModel(getGroupVersionKindForResource(obj));
    const [lastNamespace] = useLastNamespace();
    const url = redirectUrl || getResourceUrl({ model, activeNamespace: lastNamespace });

    return (
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={headerText || t('Delete Resource?')}
        onSubmit={() => {
          return onDeleteSubmit().then(() => {
            history.push(url);
          });
        }}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
        titleIconVariant={'warning'}
      >
        {bodyText || <ConfirmActionMessage obj={obj} />}
      </TabModal>
    );
  },
);

export default DeleteModal;
