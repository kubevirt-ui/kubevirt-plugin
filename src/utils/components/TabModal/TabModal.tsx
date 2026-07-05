import React, { type ComponentType, type FormEvent, memo, type ReactNode, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type ButtonVariant, Modal, ModalHeader, ModalVariant } from '@patternfly/react-core';

import TabModalBody from './components/TabModalBody';
import TabModalFooter from './components/TabModalFooter';

import './TabModal.scss';

export type TabModalResult<T extends K8sResourceCommon = K8sResourceCommon> =
  | string
  | T
  | T[]
  | V1VirtualMachine
  | void;

export type TabModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  actionItemLink?: ReactNode;
  cancelBtnText?: string;
  cancelBtnVariant?: ButtonVariant;
  children: ReactNode;
  closeOnSubmit?: boolean;
  formClassName?: string;
  headerDescription?: string;
  headerText: string;
  isDisabled?: boolean;
  isHorizontal?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  modalError?: Error;
  modalVariant?: ModalVariant;
  obj?: T;
  onCancel?: () => Promise<void> | void;
  onClose: () => Promise<void> | void;
  onSubmit: (obj: T) => Promise<TabModalResult<T>>;
  onSuccess?: (result: TabModalResult<T>) => void;
  positionTop?: boolean;
  shouldWrapInForm?: boolean;
  submitBtnText?: string;
  submitBtnVariant?: ButtonVariant;
  titleIconVariant?:
    | 'custom'
    | 'danger'
    | 'info'
    | 'success'
    | 'warning'
    | ComponentType<Record<string, unknown>>;
};

export type TabModalFC = <T extends K8sResourceCommon = K8sResourceCommon>(
  props: TabModalProps<T>,
) => ReactNode;

const TabModal: TabModalFC = memo(
  ({
    actionItemLink,
    cancelBtnText,
    cancelBtnVariant,
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
    onCancel,
    onClose,
    onSubmit,
    onSuccess,
    positionTop = true,
    shouldWrapInForm,
    submitBtnText,
    submitBtnVariant,
    titleIconVariant,
  }) => {
    const { t } = useKubevirtTranslation();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<Error>(undefined);

    const executeSubmit = (): void => {
      setIsSubmitting(true);
      setApiError(undefined);

      onSubmit(obj)
        .then(async (result) => {
          onSuccess?.(result);
          if (closeOnSubmit) {
            await onClose();
          }
        })
        .catch((submitError) => {
          setApiError(submitError);
          kubevirtConsole.error(submitError);
        })
        .finally(() => setIsSubmitting(false));
    };

    const closeModal = (): void => {
      setApiError(undefined);
      setIsSubmitting(false);

      const promise = onClose();

      if (promise) promise?.catch(setApiError);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      executeSubmit();
    };

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
        <TabModalBody
          formClassName={formClassName}
          isHorizontal={isHorizontal}
          onSubmit={handleSubmit}
          shouldWrapInForm={shouldWrapInForm}
        >
          {children}
        </TabModalBody>
        <TabModalFooter
          actionItemLink={actionItemLink}
          cancelBtnText={cancelBtnText}
          cancelBtnVariant={cancelBtnVariant}
          error={apiError || modalError}
          executeSubmit={executeSubmit}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onClose={closeModal}
          shouldWrapInForm={shouldWrapInForm}
          submitBtnText={submitBtnText ?? t('Save')}
          submitBtnVariant={submitBtnVariant}
        />
      </Modal>
    );
  },
);

export default TabModal;
