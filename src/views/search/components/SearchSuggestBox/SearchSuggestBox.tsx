import React, { FC } from 'react';
import useIsAllClustersPage from 'src/multicluster/hooks/useIsAllClustersPage';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { MAX_SUGGESTIONS } from '@kubevirt-utils/components/ListPageFilter/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  Flex,
  Panel,
  PanelMain,
  PanelMainBody,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';

import {
  AdvancedSearchInputs,
  AdvancedSearchQueryInputs,
  SearchSuggestResult,
} from '../../utils/types';
import AdvancedSearchIcon from '../AdvancedSearchIcon';

import ClusterProjectInfo from './components/ClusterProjectInfo';
import RelatedSuggestions from './components/RelatedSuggestions';
import SearchSuggestBoxFooter from './components/SearchSuggestBoxFooter';

export type SearchSuggestBoxProps = {
  cluster?: string;
  isSearchInProgress: boolean;
  maxResourceLinks?: number;
  namespace?: string;
  navigateToSearchResults: (searchInputs: AdvancedSearchQueryInputs) => void;
  searchQuery: string;
  searchSuggestResult?: SearchSuggestResult;
  showSearchModal: (prefillInputs?: AdvancedSearchInputs) => void;
};

const SearchSuggestBox: FC<SearchSuggestBoxProps> = ({
  cluster,
  isSearchInProgress,
  maxResourceLinks = MAX_SUGGESTIONS,
  namespace,
  navigateToSearchResults,
  searchQuery,
  searchSuggestResult,
  showSearchModal,
}) => {
  const { t } = useKubevirtTranslation();

  const isAllClusters = useIsAllClustersPage();

  const suggestResources = searchSuggestResult?.resources.slice(0, maxResourceLinks) ?? [];
  const hasResourcesToSuggest = suggestResources.length > 0;

  const hasRelatedSuggestions = Object.values(searchSuggestResult?.resourcesMatching ?? {}).some(
    (count) => count > 0,
  );

  return (
    <Panel>
      <div data-test="search-bar-results">
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
                        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                          <FleetResourceLink
                            cluster={resource.cluster}
                            groupVersionKind={VirtualMachineModelGroupVersionKind}
                            hideIcon
                            name={resource.name}
                            namespace={resource.namespace}
                          />
                          <ClusterProjectInfo
                            isAllClusters={isAllClusters}
                            isAllNamespaces={isEmpty(namespace)}
                            resource={resource}
                          />
                        </Flex>
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
                            icon={<AdvancedSearchIcon />}
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
            cluster={cluster}
            namespace={namespace}
            navigateToSearchResults={navigateToSearchResults}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </Panel>
  );
};

export default SearchSuggestBox;
