import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonProps,
  ButtonVariant,
  Divider,
  Flex,
  PanelFooter,
} from '@patternfly/react-core';
import AdvancedSearchIcon from '@search/components/AdvancedSearchIcon';
import { buildContextSearchInputs } from '@search/utils/query';

import { SearchSuggestBoxProps } from '../SearchSuggestBox';

export type SearchSuggestBoxFooterProps = {
  cluster?: string;
  namespace?: string;
  navigateToSearchResults: SearchSuggestBoxProps['navigateToSearchResults'];
  onAdvancedSearchClick: ButtonProps['onClick'];
  searchQuery: SearchSuggestBoxProps['searchQuery'];
};

const SearchSuggestBoxFooter: FCC<SearchSuggestBoxFooterProps> = ({
  cluster,
  namespace,
  navigateToSearchResults,
  onAdvancedSearchClick,
  searchQuery,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Divider className="pf-v6-u-px-md" />
      <PanelFooter className="pf-v6-u-py-md">
        <Flex>
          <Button
            onClick={() => {
              navigateToSearchResults({
                ...buildContextSearchInputs(cluster, namespace),
                name: searchQuery,
              });
            }}
          >
            {t('Search all')}
          </Button>
          <Button
            data-test="results-advanced-search"
            icon={<AdvancedSearchIcon isLarge />}
            iconPosition="end"
            onClick={onAdvancedSearchClick}
            variant={ButtonVariant.secondary}
          >
            {t('Advanced search')}
          </Button>
        </Flex>
      </PanelFooter>
    </>
  );
};

export default SearchSuggestBoxFooter;
