import React, { FC, useCallback } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';

import SaveSearchModal from './SaveSearchModal';

const SaveSearchButton: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { saveSearch, urlSearchQuery } = useSavedSearchData();

  const showSaveSearchModal = useCallback(() => {
    createModal(({ isOpen, onClose }) => (
      <SaveSearchModal
        onSubmit={({ description, name }) => {
          saveSearch(name, { description, query: urlSearchQuery });
          onClose();
        }}
        isOpen={isOpen}
        onClose={onClose}
      />
    ));
  }, [createModal, saveSearch, urlSearchQuery]);

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
