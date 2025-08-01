import React, { FC } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { MAX_SUGGESTIONS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  Panel,
  PanelMain,
  PanelMainBody,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import SlidersHIcon from '@patternfly/react-icons/dist/esm/icons/sliders-h-icon';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

import {
  AdvancedSearchInputs,
  AdvancedSearchQueryInputs,
  SearchSuggestResult,
} from '../../utils/types';

import RelatedSuggestions from './components/RelatedSuggestions';
import SearchSuggestBoxFooter from './components/SearchSuggestBoxFooter';
import SearchSuggestBoxHeader from './components/SearchSuggestBoxHeader';

export type SearchSuggestBoxProps = {
  isSearchInProgress: boolean;
  maxResourceLinks?: number;
  navigateToSearchResults: (searchInputs: AdvancedSearchQueryInputs) => void;
  searchQuery: string;
  searchSuggestResult?: SearchSuggestResult;
  showSearchModal: (prefillInputs?: AdvancedSearchInputs) => void;
};

const SearchSuggestBox: FC<SearchSuggestBoxProps> = ({
  isSearchInProgress,
  maxResourceLinks = MAX_SUGGESTIONS,
  navigateToSearchResults,
  searchQuery,
  searchSuggestResult,
  showSearchModal,
}) => {
  const { t } = useKubevirtTranslation();

  const suggestResources = searchSuggestResult?.resources.slice(0, maxResourceLinks) ?? [];
  const hasResourcesToSuggest = suggestResources.length > 0;

  const hasRelatedSuggestions = Object.values(searchSuggestResult?.resourcesMatching ?? {}).some(
    (count) => count > 0,
  );

  return (
    <Panel>
      <div data-test="search-bar-results">
        {hasResourcesToSuggest && (
          <SearchSuggestBoxHeader
            navigateToSearchResults={navigateToSearchResults}
            searchQuery={searchQuery}
          />
        )}
        <PanelMain>
          {isSearchInProgress && (
            <EmptyState
              headingLevel="h4"
              icon={Spinner}
              titleText={t('Loading results')}
              variant="xs"
            />
          )}
          {!isSearchInProgress && (
            <>
              <PanelMainBody>
                <Stack hasGutter>
                  {hasResourcesToSuggest &&
                    suggestResources.map((resource, index) => (
                      <StackItem key={`${index}_${resource.name}`}>
                        <FleetResourceLink
                          cluster={resource.cluster}
                          groupVersionKind={VirtualMachineModelGroupVersionKind}
                          hideIcon
                          name={resource.name}
                          namespace={resource.namespace}
                        />
                      </StackItem>
                    ))}
                  {!hasResourcesToSuggest && (
                    <StackItem>
                      <EmptyState
                        headingLevel="h4"
                        titleText={t('No results found for "{{searchQuery}}"', { searchQuery })}
                        variant="xs"
                      >
                        <EmptyStateBody>
                          {t('Try using the')}{' '}
                          <Button
                            onClick={() => {
                              showSearchModal();
                            }}
                            data-test="try-advanced-search"
                            icon={<SlidersHIcon />}
                            iconPosition="end"
                            isInline
                            variant={ButtonVariant.link}
                          >
                            {t('advanced search')}
                          </Button>
                        </EmptyStateBody>
                      </EmptyState>
                    </StackItem>
                  )}
                </Stack>
              </PanelMainBody>
              {hasRelatedSuggestions && (
                <RelatedSuggestions
                  searchQuery={searchQuery}
                  searchSuggestResult={searchSuggestResult}
                  showSearchModal={showSearchModal}
                />
              )}
            </>
          )}
        </PanelMain>
        {hasResourcesToSuggest && (
          <SearchSuggestBoxFooter
            onAdvancedSearchClick={() => {
              showSearchModal({ name: searchQuery });
            }}
          />
        )}
      </div>
    </Panel>
  );
};

export default SearchSuggestBox;
