import React, { ComponentType, memo, MouseEventHandler, ReactNode, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './TabModal.scss';

type TabModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  isOpen: boolean;
  obj?: T;
  onSubmit: (obj: T) => Promise<T | T[] | void>;
  onClose: () => Promise<void> | void;
  headerText: string;
  children: ReactNode;
  isDisabled?: boolean;
  submitBtnText?: string;
  modalVariant?: ModalVariant;
  positionTop?: boolean;
  submitBtnVariant?: ButtonVariant;
  modalError?: any;
  titleIconVariant?: 'success' | 'danger' | 'warning' | 'info' | 'default' | ComponentType<any>;
};

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
) => JSX.Element;

const TabModal: TabModalFC = memo(
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
    positionTop = true,
    submitBtnVariant,
    titleIconVariant,
    modalError,
  }) => {
    const { t } = useKubevirtTranslation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<any>(undefined);

    const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setApiError(undefined);

      onSubmit(obj)
        .then(onClose)
        .catch((submitError) => {
          setApiError(submitError);
          console.error(submitError);
        })
        .finally(() => setIsSubmitting(false));
    };

    const closeModal = () => {
      setApiError(undefined);
      setIsSubmitting(false);

      const promise = onClose();

      if (promise) promise?.catch(setApiError);
    };

    const error = apiError || modalError;

    return (
      <Modal
        variant={modalVariant ?? 'small'}
        position={positionTop ? 'top' : undefined}
        className="ocs-modal"
        onClose={closeModal}
        title={headerText}
        titleIconVariant={titleIconVariant}
        footer={
          <Stack className="kv-tabmodal-footer" hasGutter>
            {error && (
              <StackItem>
                <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
                  <Stack hasGutter>
                    <StackItem>{error.message}</StackItem>
                    {error?.href && (
                      <StackItem>
                        <a href={error.href} target="_blank" rel="noreferrer">
                          {error.href}
                        </a>
                      </StackItem>
                    )}
                  </Stack>
                </Alert>
              </StackItem>
            )}
            <StackItem>
              <ActionList>
                <ActionListItem>
                  <Button
                    onClick={handleSubmit}
                    isDisabled={isDisabled || isSubmitting}
                    isLoading={isSubmitting}
                    variant={submitBtnVariant ?? 'primary'}
                  >
                    {submitBtnText || t('Save')}
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button onClick={closeModal} variant="link">
                    {t('Cancel')}
                  </Button>
                </ActionListItem>
              </ActionList>
            </StackItem>
          </Stack>
        }
        isOpen={isOpen}
        id="tab-modal"
      >
        {children}
      </Modal>
    );
  },
);

export default TabModal;
