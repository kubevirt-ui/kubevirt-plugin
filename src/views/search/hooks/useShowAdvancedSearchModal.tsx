import React, { useCallback } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { logVMAdvancedSearchModalUsed } from '@kubevirt-utils/extensions/telemetry/dashboard';
import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import AdvancedSearchModal from '@search/components/AdvancedSearchModal/AdvancedSearchModal';
import { emptyFilterState } from '@search/utils/constants';
import { convertModalInputsToFilterState } from '@search/utils/query';
import { type AdvancedSearchInputs } from '@search/utils/types';

type UseShowAdvancedSearchModal = (
  onSetFilters: OnSetFilters,
  vms: V1VirtualMachine[],
) => (prefillInputs?: AdvancedSearchInputs) => void;

const useShowAdvancedSearchModal: UseShowAdvancedSearchModal = (onSetFilters, vms) => {
  const { createModal } = useModal();

  const showSearchModal = useCallback(
    (prefillInputs?: AdvancedSearchInputs) => {
      createModal(({ isOpen, onClose }) => (
        <AdvancedSearchModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={(searchInputs) => {
            const filterState = convertModalInputsToFilterState(searchInputs);
            onSetFilters({ ...emptyFilterState, ...filterState });
            logVMAdvancedSearchModalUsed(filterState);
            onClose();
          }}
          prefillInputs={prefillInputs}
          vms={vms}
        />
      ));
    },
    [createModal, onSetFilters, vms],
  );

  return showSearchModal;
};

export default useShowAdvancedSearchModal;
