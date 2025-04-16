import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import {
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  SearchInput,
  SearchInputProps,
  Popper,
  Panel,
  PanelHeader,
  PanelFooter,
  PanelMain,
  PanelMainBody,
  Divider,
  Button,
  EmptyState,
  Spinner,
  Stack,
  StackItem,
  Tooltip,
  InputGroup,
  Menu,
  MenuToggle,
  InputGroupItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useVirtualMachineSearchSuggestions } from '@virtualmachines/search/hooks/useVirtualMachineSearchSuggestions';
import AdvancedSearchModal, { AdvancedSearchInputs } from './AdvancedSearchModal';

import './search-bar.scss';

export type SearchSuggestResult = {
  resources: { name: string; namespace?: string }[];
  resourcesMatching: Record<'description', number>;
};

type SearchBarProps = {};

const urlEncodeSearchInputs = ({ name, namespace, description }: AdvancedSearchInputs) => {
  const result: string[] = [];

  result.push(name ? `${name}` : '');
  result.push(namespace ? `ns=${namespace}` : '');
  result.push(description ? `ds=${description}` : '');

  return result
    .filter((value) => !!value)
    .map(encodeURIComponent)
    .join('+');
};

const SearchBar: FC<SearchBarProps> = () => {
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
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={(searchInputs) => {
            navigateToSearchResults(searchInputs);
            onClose();
          }}
          prefillInputs={prefillInputs}
        />
      ));
    },
    [createModal, navigateToSearchResults],
  );

  const searchInput = (
    <SearchInput
      value={searchQuery}
      onChange={onSearchInputChange}
      onClick={() => searchQuery && setIsSearchSuggestBoxOpen(true)}
      onClear={onSearchInputClear}
      placeholder={t('Search VirtualMachines')}
      ref={searchInputRef}
      id="vm-search-input"
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
      className="pf-v6-u-pt-0"
      ref={searchSuggestBoxRef}
      role="dialog"
      aria-label={t('Search suggest box')}
    >
      <Panel>
        <PanelHeader>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              navigateToSearchResults({ name: searchQuery });
            }}
          >
            <strong>{t('All search results for "{{searchQuery}}"', { searchQuery })}</strong>
          </Button>
        </PanelHeader>
        <Divider />
        <PanelMain>
          {isSearchInProgress && (
            <EmptyState titleText="Loading results" icon={Spinner} variant="sm" headingLevel="h4" />
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
                          name={name}
                          namespace={namespace}
                          hideIcon
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
                      variant="link"
                      size="sm"
                      onClick={() => {
                        showSearchModal({ description: searchQuery });
                      }}
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
            variant="secondary"
            size="sm"
            onClick={() => {
              showSearchModal();
            }}
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
        trigger={searchInput}
        triggerRef={searchInputRef}
        popper={searchSuggestBox}
        popperRef={searchSuggestBoxRef}
        isVisible={isSearchSuggestBoxOpen}
        appendTo={getSearchInputElement}
        enableFlip={false}
        onDocumentClick={() => setIsSearchSuggestBoxOpen(false)}
      />
      <Tooltip content={t('Advanced search')}>
        <Button
          icon={<FilterIcon />}
          variant="control"
          onClick={() => {
            showSearchModal();
          }}
        />
      </Tooltip>
      <InputGroupItem>
        <MenuToggle>{t('Saved searches')}</MenuToggle>
      </InputGroupItem>
    </InputGroup>
  );
};

export default SearchBar;
