import React from 'react';
import { useCallback } from 'react';

import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

type UseDeleteSavedSearch = (
  deleteSearch: (name: string) => void,
  setOpen: (open: boolean) => void,
) => (name: string, isFavorited: boolean) => void;

const useDeleteSavedSearch: UseDeleteSavedSearch = (deleteSearch, setOpen) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();

  const handleDelete = useCallback(
    (name: string, isFavorited: boolean) => {
      if (isFavorited) {
        setOpen(false);
        createModal(({ isOpen, onClose }) => (
          <DeleteModal
            body={t('This will permanently delete "{{name}}" and remove it from your favorites.', {
              name,
            })}
            onDeleteSubmit={async () => {
              deleteSearch(name);
            }}
            headerText={t('Delete favorite saved search?')}
            isOpen={isOpen}
            obj={{}}
            onClose={onClose}
            shouldRedirect={false}
          />
        ));
      } else {
        deleteSearch(name);
      }
    },
    [createModal, deleteSearch, t],
  );

  return handleDelete;
};

export default useDeleteSavedSearch;
