import * as React from 'react';

export type ModalComponentProps = {
  appendTo: () => HTMLElement;
  isOpen: boolean;
  onClose: () => void;
};
export type ModalComponent = React.ComponentType<ModalComponentProps>;

export type ModalContextType = {
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
  /** callback to close the modal */
  onClose?: () => void;
};

export const ModalContext = React.createContext<ModalContextType>({});
/**
 * A hook that returns a global modal context. This context is used to inject a modal component to the dom.
 * @example
 * const { createModal } = useModal();
 *
 * createModal(({ isOpen, onClose, appendTo }) => (
 *  <ExampleModal isOpen={isOpen} onClose={onClose} appendTo={appendTo} />
 * ))
 */
export const useModal = () => React.useContext(ModalContext);

export const useModalValue = (): ModalContextType => {
  const [modal, setModal] = React.useState<ModalComponent>();
  const [isOpen, setIsOpen] = React.useState(false);

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

export const ModalProvider: React.FC<{ value: ModalContextType }> = ({ children, value = {} }) => {
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
