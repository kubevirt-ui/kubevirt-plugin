import React, { FC, memo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

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
  body?: ReactNode | string;
  headerText?: string;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onDeleteSubmit: () => Promise<K8sResourceCommon | void>;
  redirectUrl?: string;
  shouldRedirect?: boolean;
};

const DeleteModal: FC<DeleteModalProps> = memo(
  ({
    body,
    headerText,
    isOpen,
    obj,
    onClose,
    onDeleteSubmit,
    redirectUrl,
    shouldRedirect = true,
  }) => {
    const { t } = useKubevirtTranslation();
    const navigate = useNavigate();

    const [model] = useK8sModel(getGroupVersionKindForResource(obj));
    const [lastNamespace] = useLastNamespace();
    const url = redirectUrl || getResourceUrl({ activeNamespace: lastNamespace, model });

    return (
      <TabModal<K8sResourceCommon>
        onSubmit={async () => {
          await onDeleteSubmit();
          shouldRedirect && navigate(url);
        }}
        headerText={headerText || t('Delete Resource?')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
        titleIconVariant="warning"
      >
        {body || <ConfirmActionMessage obj={obj} />}
      </TabModal>
    );
  },
);

export default DeleteModal;
