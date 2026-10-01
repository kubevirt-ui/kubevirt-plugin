import { type FC, memo, type ReactNode, useState } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  getGroupVersionKindForResource,
  type K8sResourceCommon,
  useK8sModel,
} from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Content, TextInput } from '@patternfly/react-core';

import ConfirmActionMessage from '../ConfirmActionMessage/ConfirmActionMessage';

type DeleteModalProps = {
  body?: ReactNode;
  headerText?: string;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onDeleteSubmit: () => Promise<K8sResourceCommon | void>;
  redirectUrl?: string;
  requireNameConfirmation?: boolean;
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
    requireNameConfirmation = false,
    shouldRedirect = true,
  }) => {
    const { t } = useKubevirtTranslation();
    const navigate = useNavigate();
    const [confirmationName, setConfirmationName] = useState('');
    const name = getName(obj);

    const [model] = useK8sModel(getGroupVersionKindForResource(obj));
    const namespace = useNamespaceParam();
    const url = redirectUrl ?? getResourceUrl({ activeNamespace: namespace, model });

    return (
      <TabModal<K8sResourceCommon>
        headerText={headerText ?? t('Delete resource?')}
        isDisabled={requireNameConfirmation && confirmationName !== name}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={async () => {
          await onDeleteSubmit();
          shouldRedirect && void navigate(url);
        }}
        submitBtnText={t('Delete')}
        submitBtnVariant={ButtonVariant.danger}
        titleIconVariant="warning"
      >
        {body || <ConfirmActionMessage obj={obj} />}
        {requireNameConfirmation && (
          <>
            <Content component="p">
              <Trans t={t}>
                Confirm deletion by typing <strong>{{ name }}</strong> below:
              </Trans>
            </Content>
            <TextInput
              aria-label={t('Enter the name of the resource to delete')}
              autoFocus
              id="delete-resource-name"
              onChange={(_event, value) => setConfirmationName(value)}
              placeholder={t('Enter name')}
              type="text"
              value={confirmationName}
            />
          </>
        )}
      </TabModal>
    );
  },
);

export default DeleteModal;
