import React, {
  ComponentType,
  createContext,
  createElement,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';

/* eslint-disable react/no-unused-prop-types */
export type ModalComponentProps = {
  appendTo: () => HTMLElement;
  isOpen: boolean;
  onClose: () => void;
};

export type ModalComponent = ComponentType<ModalComponentProps>;

export type ModalContextType = {
  /** cluster parameter from router context */
  cluster?: string;
  /** receives a modal component as an argument and injects it to the dom, the component callback will receive the following parameters,
   * isOpen: open state of the modal
   * onClose: callback to close the modal
   * appendTo: callback to get the dom element to append the modal to
   * @example
   * const { createModal } = useModal();
   *
   * createModal(({ isOpen, onClose, appendTo }) => (
   *  <ExampleModal isOpen={isOpen} onClose={onClose} appendTo={appendTo} />
   * ))
   *
   */
  createModal?: (modal: ModalComponent) => void;
  /** whether the modal is open */
  isOpen?: boolean;
  /** the modal component to render */
  modal?: ModalComponent;
  /** namespace parameter from router context */
  namespace?: string;
  /** callback to close the modal */
  onClose?: () => void;
};

export const ModalContext = createContext<ModalContextType>({});
/**
 * A hook that returns a global modal context. This context is used to inject a modal component to the dom.
 * Automatically captures router context when available and injects it into modals.
 * @example
 * const { createModal, namespace, cluster } = useModal();
 *
 * createModal(({ isOpen, onClose, appendTo }) => (
 *  <ExampleModal isOpen={isOpen} onClose={onClose} appendTo={appendTo} />
 * ))
 */

export const useModalWithRouterContext = () => {
  const context = useContext(ModalContext);
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();

  const createModal = useCallback(
    (newModal: ModalComponent) => {
      const ModalWithContext = (props: ModalComponentProps) => {
        const contextValue = useMemo(
          () => ({ ...context, cluster, namespace }),
          [context, namespace, cluster],
        );
        return (
          <ModalContext.Provider value={contextValue}>
            {createElement(newModal, props)}
          </ModalContext.Provider>
        );
      };

      context.createModal?.(ModalWithContext);
    },
    [context, namespace, cluster],
  );

  return {
    ...context,
    cluster,
    createModal,
    namespace,
  };
};

export const useModal = () => {
  const context = useContext(ModalContext);

  const createModal = useCallback(
    (newModal: ModalComponent) => {
      context.createModal?.(newModal);
    },
    [context],
  );

  return {
    ...context,
    createModal,
  };
};

export const useModalValue = (): ModalContextType => {
  const [modal, setModal] = useState<ModalComponent>();
  const [isOpen, setIsOpen] = useState(false);

  const createModal = (newModal: ModalComponent) => {
    setIsOpen(true);
    setModal(() => newModal);
  };

  const onClose = () => {
    setIsOpen(false);
    setModal(undefined);
  };

  return { createModal, isOpen, modal, onClose };
};

export const ModalProvider: FC<{ value: ModalContextType }> = ({ children, value = {} }) => {
  const { isOpen, modal: Modal, onClose } = value;

  return (
    <ModalContext.Provider value={value}>
      {Modal && isOpen && (
        <Modal
          appendTo={() => document.querySelector('#modal-container')}
          isOpen
          onClose={onClose}
        />
      )}
      {children}
    </ModalContext.Provider>
  );
};
