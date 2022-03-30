import * as React from 'react';

export type ModalComponentProps = {
  isOpen: boolean;
  onClose: () => void;
  appendTo: () => HTMLElement;
};
export type ModalComponent = React.ComponentType<ModalComponentProps>;

export type ModalContextType = {
  /** the modal component to render */
  modal?: ModalComponent;
  /** whether the modal is open */
  isOpen?: boolean;
  /** callback to close the modal */
  onClose?: () => void;
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

  const createModal = (modal: ModalComponent) => {
    setIsOpen(true);
    setModal(() => modal);
  };

  const onClose = () => {
    setIsOpen(false);
    setModal(undefined);
  };

  return { modal, isOpen, createModal, onClose };
};

export const ModalProvider: React.FC<{ value: ModalContextType }> = ({ value = {}, children }) => {
  const { modal: Modal, isOpen, onClose } = value;

  return (
    <ModalContext.Provider value={value}>
      {Modal && isOpen && (
        <Modal
          isOpen
          onClose={onClose}
          appendTo={() => document.querySelector('#modal-container')}
        />
      )}
      {children}
    </ModalContext.Provider>
  );
};
