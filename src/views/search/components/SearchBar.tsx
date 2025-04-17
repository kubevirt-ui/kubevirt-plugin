import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import debounce from 'lodash/debounce';

import {
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Divider,
  EmptyState,
  InputGroup,
  InputGroupItem,
  Menu,
  MenuToggle,
  Panel,
  PanelFooter,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Popper,
  SearchInput,
  SearchInputProps,
  Spinner,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import SlidersHIcon from '@patternfly/react-icons/dist/esm/icons/sliders-h-icon';
import { useVirtualMachineSearchSuggestions } from '@virtualmachines/search/hooks/useVirtualMachineSearchSuggestions';

import AdvancedSearchModal, {
  AdvancedSearchInputs,
} from './AdvancedSearchModal/AdvancedSearchModal';

import './search-bar.scss';

export type SearchSuggestResult = {
  resources: { name: string; namespace?: string }[];
  resourcesMatching: Record<'description', number>;
};

const urlEncodeSearchInputs = ({
  description,
  name,
  projects: namespaces,
}: AdvancedSearchInputs) => {
  const result: string[] = [];

  result.push(name ? `${name}` : '');
  result.push(namespaces ? `ns=${namespaces.join(',')}` : '');
  result.push(description ? `ds=${description}` : '');

  return result
    .filter((value) => !!value)
    .map(encodeURIComponent)
    .join('+');
};

const SearchBar: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchSuggestBoxOpen, setIsSearchSuggestBoxOpen] = useState(false);
  const [isSearchInProgress, setIsSearchInProgress] = useState(false);
  const [searchSuggestResult, setSearchSuggestResult] = useState<SearchSuggestResult>();

  const searchInputRef = useRef();
  const searchSuggestBoxRef = useRef();

  const [vmSuggestions, vmSuggestionsLoaded] = useVirtualMachineSearchSuggestions(searchQuery);

  useEffect(() => {
    // TODO: specify rules for validating search query
    if (searchQuery) {
      setIsSearchSuggestBoxOpen(true);
      setIsSearchInProgress(!vmSuggestionsLoaded);
      setSearchSuggestResult(vmSuggestions);
    } else {
      setIsSearchSuggestBoxOpen(false);
      setIsSearchInProgress(false);
      setSearchSuggestResult(undefined);
    }
  }, [
    searchQuery,
    setIsSearchSuggestBoxOpen,
    setIsSearchInProgress,
    setSearchSuggestResult,
    vmSuggestions,
    vmSuggestionsLoaded,
  ]);

  const onSearchInputChange = useCallback<SearchInputProps['onChange']>(
    debounce((_, value) => {
      setSearchQuery(value);
    }, 500),
    [setSearchQuery],
  );

  const onSearchInputClear = useCallback<SearchInputProps['onClear']>(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const navigateToSearchResults = useCallback(
    (searchInputs: AdvancedSearchInputs) => {
      navigate(
        `/k8s/all-namespaces/${VirtualMachineModelRef}/search#q=${urlEncodeSearchInputs(
          searchInputs,
        )}`,
      );
    },
    [navigate],
  );

  const showSearchModal = useCallback(
    (prefillInputs?: AdvancedSearchInputs) => {
      // TODO: hide suggest box before opening modal?
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

  const searchInput = (
    <SearchInput
      id="vm-search-input"
      onChange={onSearchInputChange}
      onClear={onSearchInputClear}
      onClick={() => searchQuery && setIsSearchSuggestBoxOpen(true)}
      placeholder={t('Search VirtualMachines')}
      ref={searchInputRef}
      value={searchQuery}
    />
  );

  const getSearchInputElement = useCallback(
    () => document.querySelector<HTMLInputElement>('#vm-search-input'),
    [],
  );

  // TODO: specify upper limit of resource links to display
  const suggestResources = searchSuggestResult?.resources?.slice(0, 10) ?? [];
  const suggestMatchesBy = searchSuggestResult?.resourcesMatching ?? { description: 0 };

  const searchSuggestBox = (
    <Menu
      aria-label={t('Search suggest box')}
      className="pf-v6-u-pt-0"
      ref={searchSuggestBoxRef}
      role="dialog"
    >
      <Panel>
        <PanelHeader>
          <Button
            onClick={() => {
              navigateToSearchResults({ name: searchQuery });
            }}
            size="sm"
            variant="link"
          >
            <strong>{t('All search results for "{{searchQuery}}"', { searchQuery })}</strong>
          </Button>
        </PanelHeader>
        <Divider />
        <PanelMain>
          {isSearchInProgress && (
            <EmptyState headingLevel="h4" icon={Spinner} titleText="Loading results" variant="sm" />
          )}
          {!isSearchInProgress && (
            <>
              <PanelMainBody>
                <Stack hasGutter>
                  {suggestResources.length > 0 &&
                    suggestResources.map(({ name, namespace }, index) => (
                      <StackItem key={`${index}_${name}`}>
                        {/* TODO: add prop to ResourceLink to highlight specific text */}
                        <ResourceLink
                          groupVersionKind={VirtualMachineModelGroupVersionKind}
                          hideIcon
                          name={name}
                          namespace={namespace}
                        />
                      </StackItem>
                    ))}
                  {suggestResources.length === 0 && (
                    <StackItem>
                      {t('No results matching name "{{searchQuery}}"', { searchQuery })}
                    </StackItem>
                  )}
                </Stack>
              </PanelMainBody>
              <Divider />
              <PanelMainBody>
                <Stack hasGutter>
                  <StackItem>
                    <strong>{t('More suggestions')}</strong>
                  </StackItem>
                  <StackItem>
                    {t('Description')}
                    <Button
                      onClick={() => {
                        showSearchModal({ description: searchQuery });
                      }}
                      size="sm"
                      variant="link"
                    >
                      {t('({{count}})', { count: suggestMatchesBy.description })}
                    </Button>
                  </StackItem>
                </Stack>
              </PanelMainBody>
            </>
          )}
        </PanelMain>
        <Divider />
        <PanelFooter className="pf-v6-u-pt-md">
          <Button
            onClick={() => {
              showSearchModal();
            }}
            icon={<SlidersHIcon />}
            iconPosition="end"
            size="sm"
            variant="secondary"
          >
            {t('Advanced search')}
          </Button>
        </PanelFooter>
      </Panel>
    </Menu>
  );

  return (
    <InputGroup className="vm-search-bar pf-v6-u-mr-md">
      <Popper
        appendTo={getSearchInputElement}
        enableFlip={false}
        isVisible={isSearchSuggestBoxOpen}
        onDocumentClick={() => setIsSearchSuggestBoxOpen(false)}
        popper={searchSuggestBox}
        popperRef={searchSuggestBoxRef}
        trigger={searchInput}
        triggerRef={searchInputRef}
      />
      <Tooltip content={t('Advanced search')}>
        <Button
          onClick={() => {
            showSearchModal();
          }}
          icon={<SlidersHIcon />}
          variant="control"
        />
      </Tooltip>
      <InputGroupItem>
        <MenuToggle>{t('Saved searches')}</MenuToggle>
      </InputGroupItem>
    </InputGroup>
  );
};

export default SearchBar;
