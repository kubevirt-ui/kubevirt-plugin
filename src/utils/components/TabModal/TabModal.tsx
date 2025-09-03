import React, {
  ComponentType,
  forwardRef,
  memo,
  MouseEventHandler,
  ReactNode,
  RefAttributes,
  useImperativeHandle,
  useState,
} from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './TabModal.scss';

export type TabModalRefExposedFunctions = {
  handleSubmit: (e: React.FormEvent) => void;
};

export type TabModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  actionItemLink?: ReactNode;
  children: ReactNode;
  closeOnSubmit?: boolean;
  headerText: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  modalError?: any;
  modalVariant?: ModalVariant;
  obj?: T;
  onClose: () => Promise<void> | void;
  onSubmit: (obj: T) => Promise<string | T | T[] | V1VirtualMachine | void>;
  positionTop?: boolean;
  submitBtnText?: string;
  submitBtnVariant?: ButtonVariant;
  titleIconVariant?: 'custom' | 'danger' | 'info' | 'success' | 'warning' | ComponentType<any>;
} & RefAttributes<TabModalRefExposedFunctions>;

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
  ref: React.Ref<TabModalRefExposedFunctions>,
) => JSX.Element;

const TabModal: TabModalFC = memo(
  forwardRef(
    (
      {
        actionItemLink,
        children,
        closeOnSubmit = true,
        headerText,
        isDisabled,
        isLoading,
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
      },
      ref,
    ) => {
      const { t } = useKubevirtTranslation();

      const [isSubmitting, setIsSubmitting] = useState(false);
      const [apiError, setApiError] = useState<any>(undefined);

      const handleSubmit: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
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

      // Expose handleSubmit to parent components
      useImperativeHandle(ref, () => ({
        handleSubmit,
      }));

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
          <ModalHeader title={headerText} titleIconVariant={titleIconVariant} />
          <ModalBody>{children}</ModalBody>
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
                  isDisabled={isDisabled || isSubmitting}
                  isLoading={isLoading || isSubmitting}
                  onClick={handleSubmit}
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
  ),
);

export default TabModal;
