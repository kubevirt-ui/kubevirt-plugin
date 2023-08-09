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
  bodyText?: ReactNode | string;
  headerText?: string;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onDeleteSubmit: () => Promise<K8sResourceCommon | void>;
  redirectUrl?: string;
};

const DeleteModal: FC<DeleteModalProps> = memo(
  ({ bodyText, headerText, isOpen, obj, onClose, onDeleteSubmit, redirectUrl }) => {
    const { t } = useKubevirtTranslation();
    const history = useHistory();

    const [model] = useK8sModel(getGroupVersionKindForResource(obj));
    const [lastNamespace] = useLastNamespace();
    const url = redirectUrl || getResourceUrl({ activeNamespace: lastNamespace, model });

    return (
      <TabModal<K8sResourceCommon>
        onSubmit={async () => {
          await onDeleteSubmit();
          history.push(url);
        }}
        headerText={headerText || t('Delete Resource?')}
        isOpen={isOpen}
        obj={obj}
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
