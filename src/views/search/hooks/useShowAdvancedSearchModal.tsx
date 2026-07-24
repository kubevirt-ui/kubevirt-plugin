import React, { useCallback } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { logVMAdvancedSearchModalUsed } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import AdvancedSearchModal from '@search/components/AdvancedSearchModal/AdvancedSearchModal';
import { convertModalInputsToFilterState } from '@search/utils/query';
import { AdvancedSearchInputs } from '@search/utils/types';

type UseShowAdvancedSearchModal = (
  onSetFilters: OnSetFilters,
  clearAllFilters: () => void,
  vms: V1VirtualMachine[],
) => (prefillInputs?: AdvancedSearchInputs) => void;

const useShowAdvancedSearchModal: UseShowAdvancedSearchModal = (
  onSetFilters,
  clearAllFilters,
  vms,
) => {
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
          vms={vms}
        />
      ));
    },
    [createModal, clearAllFilters, onSetFilters, vms],
  );

  return showSearchModal;
};

export default useShowAdvancedSearchModal;
