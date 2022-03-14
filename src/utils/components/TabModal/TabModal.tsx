import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionGroup,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Trans } from 'react-i18next';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const DeleteResourceMessege: React.FC<{ obj: K8sResourceCommon }> = ({ obj }) => {
  const { t } = useKubevirtTranslation();
  return (
    <Trans t={t}>
      Are you sure you want to delete <strong>{obj.metadata.name} </strong>from namespace{' '}
      <strong>{obj.metadata.namespace}?</strong>
    </Trans>
  );
};

type TabModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  isOpen: boolean;
  obj: T;
  onSubmit: (obj: T) => Promise<T | void>;
  onClose: () => void;
  headerText: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  submitBtnText?: string;
  modalVariant?: ModalVariant;
  submitBtnVariant?: ButtonVariant;
};

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
) => JSX.Element;

const TabModal: TabModalFC = React.memo(
  ({
    obj,
    onSubmit,
    isOpen,
    onClose,
    headerText,
    children,
    isDisabled,
    submitBtnText,
    modalVariant,
    submitBtnVariant,
  }) => {
    const { t } = useKubevirtTranslation();

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(undefined);

    const handleSubmit = () => {
      setIsSubmitting(true);
      setError(undefined);

      onSubmit(obj)
        .then(() => {
          onClose();
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => setIsSubmitting(false));
    };

    const closeModal = () => {
      setError(undefined);
      setIsSubmitting(false);
      onClose();
    };

    return (
      <Modal
        variant={modalVariant ?? 'small'}
        position="top"
        className="ocs-modal co-catalog-page__overlay"
        onClose={closeModal}
        title={headerText}
        footer={
          <ActionGroup>
            <Button
              isSmall
              isDisabled={isDisabled}
              isLoading={isSubmitting}
              onClick={handleSubmit}
              variant={submitBtnVariant ?? 'primary'}
            >
              {submitBtnText || t('Submit')}
            </Button>
            <Button isSmall onClick={closeModal} variant="link">
              {t('Cancel')}
            </Button>
          </ActionGroup>
        }
        isOpen={isOpen}
      >
        <Stack hasGutter>
          <StackItem>{children}</StackItem>
          {error && (
            <StackItem>
              <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
                {error.message}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </Modal>
    );
  },
);

export default TabModal;
