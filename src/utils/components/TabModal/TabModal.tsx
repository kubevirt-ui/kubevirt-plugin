import { type ComponentType, memo, type ReactNode } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { type ButtonVariant, Modal, ModalHeader, ModalVariant } from '@patternfly/react-core';

import TabModalBody from './components/TabModalBody';
import TabModalFooter from './components/TabModalFooter';
import useTabModalSubmit from './hooks/useTabModalSubmit';

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
  headerDescription?: ReactNode;
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
  submitDisabledTooltip?: ReactNode;
  titleIconVariant?: 'custom' | 'danger' | 'info' | 'success' | 'warning' | ComponentType<unknown>;
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
    submitDisabledTooltip,
    titleIconVariant,
  }) => {
    const { t } = useKubevirtTranslation();
    const { apiError, closeModal, executeSubmit, handleSubmit, isSubmitting } = useTabModalSubmit({
      closeOnSubmit,
      isDisabled,
      obj,
      onClose,
      onSubmit,
      onSuccess,
    });

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
          error={apiError ?? modalError}
          executeSubmit={executeSubmit}
          isDisabled={isDisabled}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onClose={closeModal}
          shouldWrapInForm={shouldWrapInForm}
          submitBtnText={submitBtnText ?? t('Save')}
          submitBtnVariant={submitBtnVariant}
          submitDisabledTooltip={submitDisabledTooltip}
        />
      </Modal>
    );
  },
);

export default TabModal;
