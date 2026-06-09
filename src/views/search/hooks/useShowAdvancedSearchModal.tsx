import React, { useCallback } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import AdvancedSearchModal from '@search/components/AdvancedSearchModal/AdvancedSearchModal';
import { AdvancedSearchInputs } from '@search/utils/types';

import { useNavigateToSearchResults } from './useNavigateToSearchResults';

type UseShowAdvancedSearchModal = (
  onSetFilters: OnSetFilters,
  clearAllFilters: () => void,
) => (prefillInputs?: AdvancedSearchInputs) => void;

const useShowAdvancedSearchModal: UseShowAdvancedSearchModal = (onSetFilters, clearAllFilters) => {
  const { createModal } = useModal();

  const navigateToSearchResults = useNavigateToSearchResults(onSetFilters, clearAllFilters);

  const showSearchModal = useCallback(
    (prefillInputs?: AdvancedSearchInputs) => {
      createModal(({ isOpen, onClose }) => (
        <AdvancedSearchModal
          onSubmit={(searchInputs) => {
            navigateToSearchResults(searchInputs);
            onClose();
          }}
          isOpen={isOpen}
          onClose={onClose}
          prefillInputs={prefillInputs}
        />
      ));
    },
    [createModal, navigateToSearchResults],
  );

  return showSearchModal;
};

export default useShowAdvancedSearchModal;
