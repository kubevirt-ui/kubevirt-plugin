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
  children: ReactNode;
  headerText: string;
  isDisabled?: boolean;
  isOpen: boolean;
  modalError?: any;
  modalVariant?: ModalVariant;
  obj?: T;
  onClose: () => Promise<void> | void;
  onSubmit: (obj: T) => Promise<string | T | T[] | void>;
  positionTop?: boolean;
  submitBtnText?: string;
  submitBtnVariant?: ButtonVariant;
  titleIconVariant?: 'danger' | 'default' | 'info' | 'success' | 'warning' | ComponentType<any>;
};

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
) => JSX.Element;

const TabModal: TabModalFC = memo(
  ({
    children,
    headerText,
    isDisabled,
    isOpen,
    modalError,
    modalVariant,
    obj,
    onClose,
    onSubmit,
    positionTop = true,
    submitBtnText,
    submitBtnVariant,
    titleIconVariant,
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
        footer={
          <Stack className="kv-tabmodal-footer" hasGutter>
            {error && (
              <StackItem>
                <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
                  <Stack hasGutter>
                    <StackItem>{error.message}</StackItem>
                    {error?.href && (
                      <StackItem>
                        <a href={error.href} rel="noreferrer" target="_blank">
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
                    isDisabled={isDisabled || isSubmitting}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
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
        className="ocs-modal"
        id="tab-modal"
        isOpen={isOpen}
        onClose={closeModal}
        position={positionTop ? 'top' : undefined}
        title={headerText}
        titleIconVariant={titleIconVariant}
        variant={modalVariant ?? 'small'}
      >
        {children}
      </Modal>
    );
  },
);

export default TabModal;
