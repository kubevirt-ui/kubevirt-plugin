import React, { FC, useCallback } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';

import SaveSearchModal from './SaveSearchModal';

type SaveSearchButtonProps = {
  filters: KubevirtFilterState;
  onSetFilters: OnSetFilters;
};

const SaveSearchButton: FC<SaveSearchButtonProps> = ({ filters, onSetFilters }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { saveSearch, searches, urlSearchQuery } = useSavedSearchData({ filters, onSetFilters });

  const showSaveSearchModal = useCallback(() => {
    const savedSearchNames = searches.map((s) => s.name);
    createModal(({ isOpen, onClose }) => (
      <SaveSearchModal
        onSubmit={({ description, name }) => {
          saveSearch(name, { description, query: urlSearchQuery });
          onClose();
        }}
        isOpen={isOpen}
        onClose={onClose}
        savedSearchNames={savedSearchNames}
      />
    ));
  }, [createModal, saveSearch, searches, urlSearchQuery]);

  return (
    <Button
      data-test="save-search"
      isDisabled={!urlSearchQuery}
      onClick={showSaveSearchModal}
      variant="link"
    >
      {t('Save search')}
    </Button>
  );
};

export default SaveSearchButton;
