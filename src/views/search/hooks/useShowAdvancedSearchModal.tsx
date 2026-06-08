import React, { useCallback } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { logVMAdvancedSearchModalUsed } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import AdvancedSearchModal from '@search/components/AdvancedSearchModal/AdvancedSearchModal';
import { convertModalInputsToFilterState } from '@search/utils/query';
import { AdvancedSearchInputs } from '@search/utils/types';

type UseShowAdvancedSearchModal = (
  onSetFilters: OnSetFilters,
  clearAllFilters: () => void,
) => (prefillInputs?: AdvancedSearchInputs) => void;

const useShowAdvancedSearchModal: UseShowAdvancedSearchModal = (onSetFilters, clearAllFilters) => {
  const { createModal } = useModal();

  const showSearchModal = useCallback(
    (prefillInputs?: AdvancedSearchInputs) => {
      createModal(({ isOpen, onClose }) => (
        <AdvancedSearchModal
          onSubmit={(searchInputs) => {
            clearAllFilters();
            const filterState = convertModalInputsToFilterState(searchInputs);
            onSetFilters(filterState);
            logVMAdvancedSearchModalUsed(filterState);
            onClose();
          }}
          isOpen={isOpen}
          onClose={onClose}
          prefillInputs={prefillInputs}
        />
      ));
    },
    [createModal, clearAllFilters, onSetFilters],
  );

  return showSearchModal;
};

export default useShowAdvancedSearchModal;
