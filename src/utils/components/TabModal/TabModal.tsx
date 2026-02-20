import React, { ComponentType, FormEvent, memo, ReactNode, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  Form,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './TabModal.scss';

export type TabModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  actionItemLink?: ReactNode;
  children: ReactNode;
  closeOnSubmit?: boolean;
  formClassName?: string;
  headerDescription?: string;
  headerText: string;
  isDisabled?: boolean;
  isHorizontal?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  modalError?: any;
  modalVariant?: ModalVariant;
  obj?: T;
  onClose: () => Promise<void> | void;
  onSubmit: (obj: T) => Promise<string | T | T[] | V1VirtualMachine | void>;
  positionTop?: boolean;
  shouldWrapInForm?: boolean;
  submitBtnText?: string;
  submitBtnVariant?: ButtonVariant;
  titleIconVariant?: 'custom' | 'danger' | 'info' | 'success' | 'warning' | ComponentType<any>;
};

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
) => JSX.Element;

const TabModal: TabModalFC = memo(
  ({
    actionItemLink,
    children,
    closeOnSubmit = true,
    formClassName,
    headerDescription,
    headerText,
    isDisabled,
    isHorizontal,
    isLoading,
    isOpen,
    modalError,
    modalVariant,
    obj,
    onClose,
    onSubmit,
    positionTop = true,
    shouldWrapInForm,
    submitBtnText,
    submitBtnVariant,
    titleIconVariant,
  }) => {
    const { t } = useKubevirtTranslation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<Error>(undefined);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      executeSubmit();
    };

    const executeSubmit = () => {
      setIsSubmitting(true);
      setApiError(undefined);

      onSubmit(obj)
        .then(() => closeOnSubmit && onClose())
        .catch((submitError) => {
          setApiError(submitError);
          kubevirtConsole.error(submitError);
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
        className="ocs-modal"
        data-test="dialog-modal"
        id="tab-modal"
        isOpen={isOpen}
        onClose={closeModal}
        position={positionTop ? 'top' : undefined}
        variant={modalVariant ?? ModalVariant.small}
      >
        <ModalHeader
          description={headerDescription}
          title={headerText}
          titleIconVariant={titleIconVariant}
        />

        <ModalBody>
          {shouldWrapInForm ? (
            <Form
              className={formClassName}
              form="tab-modal-form"
              id="tab-modal-form"
              isHorizontal={isHorizontal}
              onSubmit={handleSubmit}
            >
              {children}
            </Form>
          ) : (
            <>{children}</>
          )}
        </ModalBody>
        <ModalFooter>
          <Stack className="kv-tabmodal-footer" hasGutter>
            {error && (
              <StackItem>
                <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
                  <Stack hasGutter>
                    <StackItem>{error.message}</StackItem>
                    {error.response?.data && <StackItem>{error.response?.data}</StackItem>}
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
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <Button
                data-test="save-button"
                form="tab-modal-form"
                isDisabled={isDisabled || isSubmitting}
                isLoading={isLoading || isSubmitting}
                onClick={shouldWrapInForm ? undefined : executeSubmit}
                type="submit"
                variant={submitBtnVariant ?? ButtonVariant.primary}
              >
                {submitBtnText || t('Save')}
              </Button>
              <Button data-test="cancel-button" onClick={closeModal} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
              {actionItemLink && (
                <div className="kv-tabmodal-footer__action-item-link">{actionItemLink}</div>
              )}
            </Flex>
          </Stack>
        </ModalFooter>
      </Modal>
    );
  },
);

export default TabModal;
