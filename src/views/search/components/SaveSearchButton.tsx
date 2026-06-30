import React, { FC, useCallback } from 'react';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { SaveIcon } from '@patternfly/react-icons';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';
import useSaveSearchButtonTooltip from '@search/hooks/useSaveSearchButtonTooltip';
import { urlQueryToSearchLanguage } from '@search/utils/query';

import SaveSearchModal from './SaveSearchModal';

type SaveSearchButtonProps = {
  isDraft: boolean;
};

const SaveSearchButton: FC<SaveSearchButtonProps> = ({ isDraft }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const { saveSearch, searches, searchesInitiallyLoaded, searchesLoadError, urlSearchQuery } =
    useSavedSearchData();
  const { isDisabled, tooltipContent } = useSaveSearchButtonTooltip({
    isDraft,
    searches,
    searchesInitiallyLoaded,
    searchesLoadError,
    urlSearchQuery,
  });

  const showSaveSearchModal = useCallback(() => {
    const savedSearchNames = searches.map((s) => s.name);
    const initialDescription = urlQueryToSearchLanguage(urlSearchQuery);

    createModal(({ isOpen, onClose }) => (
      <SaveSearchModal
        onSubmit={({ description, isFavorited, name }) => {
          saveSearch(name, { description, isFavorited, query: urlSearchQuery });
          onClose();
        }}
        initialDescription={initialDescription}
        isOpen={isOpen}
        onClose={onClose}
        savedSearchNames={savedSearchNames}
      />
    ));
  }, [createModal, saveSearch, searches, urlSearchQuery]);

  return (
    <Tooltip content={tooltipContent}>
      <span>
        <Button
          aria-label={t('Save search')}
          data-test="save-search"
          icon={<SaveIcon />}
          isDisabled={isDisabled}
          onClick={showSaveSearchModal}
          variant={ButtonVariant.plain}
        />
      </span>
    </Tooltip>
  );
};

export default SaveSearchButton;
