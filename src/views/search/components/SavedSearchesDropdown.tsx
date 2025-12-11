import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  Icon,
  MenuItemAction,
  MenuToggle,
  Spinner,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useSavedSearchData } from '@search/hooks/useSavedSearchData';

const SavedSearchesDropdown: FC = () => {
  const { t } = useKubevirtTranslation();
  const [open, setOpen] = useState(false);

  const { applySearch, deleteSearch, searches, searchesLoaded, searchesLoadError } =
    useSavedSearchData();

  const emptyStateWrapperClass =
    'pf-v6-u-mx-lg pf-v6-u-my-md pf-v6-u-text-color-subtle saved-searches-dropdown-menu';

  const renderChildren = () => {
    if (searchesLoadError) {
      return (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          className={emptyStateWrapperClass}
          gap={{ default: 'gapSm' }}
        >
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
          <span>{t('Failed to load searches')}</span>
        </Flex>
      );
    }

    if (!searchesLoaded) {
      return (
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          className={emptyStateWrapperClass}
          gap={{ default: 'gapMd' }}
        >
          <span>{t('Loading searches')}</span>
          <Spinner size="lg" />
        </Flex>
      );
    }

    if (searches.length === 0) {
      return (
        <div className={emptyStateWrapperClass}>
          {t("When you search for something and click 'Save search', it’ll show up here.")}
        </div>
      );
    }

    return (
      <DropdownList className="saved-searches-dropdown-menu" data-test="saved-searches">
        {searches.map(({ description, name }) => (
          <DropdownItem
            actions={
              <div data-test={`delete-search-item-${name}`}>
                <MenuItemAction
                  aria-label={t('Delete saved search')}
                  icon={<TrashIcon />}
                  onClick={() => deleteSearch(name)}
                />
              </div>
            }
            onClick={() => {
              applySearch(name);
              setOpen(false);
            }}
            data-test={`saved-search-item-${name}`}
            description={description}
            key={name}
          >
            {name}
          </DropdownItem>
        ))}
      </DropdownList>
    );
  };

  return (
    <Dropdown
      toggle={(toggleRef) => (
        <MenuToggle isExpanded={open} onClick={() => setOpen(!open)} ref={toggleRef}>
          {t('Saved searches')}
        </MenuToggle>
      )}
      isOpen={open}
      onOpenChange={(isOpen: boolean) => setOpen(isOpen)}
    >
      {renderChildren()}
    </Dropdown>
  );
};

export default SavedSearchesDropdown;
