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
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

type SavedSearchEntry = {
  description: string;
  name: string;
  query: string;
};

type SavedSearchesDropdownProps = {
  applySearch: (name: string) => void;
  deleteSearch: (name: string) => void;
  searches: SavedSearchEntry[];
  searchesLoaded: boolean;
  searchesLoadError: Error;
};

const SavedSearchesDropdown: FC<SavedSearchesDropdownProps> = ({
  applySearch,
  deleteSearch,
  searches,
  searchesLoaded,
  searchesLoadError,
}) => {
  const { t } = useKubevirtTranslation();
  const [open, setOpen] = useState(false);

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
              <MenuItemAction
                aria-label={t('Delete saved search')}
                icon={<TrashIcon />}
                onClick={() => deleteSearch(name)}
              />
            }
            onClick={() => {
              applySearch(name);
              setOpen(false);
            }}
            data-test-id={`saved-search-item--${name}`}
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
