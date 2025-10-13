import React, { FC } from 'react';

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

import { SearchSuggestBoxProps } from '../SearchSuggestBox';

export type SearchSuggestBoxFooterProps = {
  navigateToSearchResults: SearchSuggestBoxProps['navigateToSearchResults'];
  onAdvancedSearchClick: ButtonProps['onClick'];
  searchQuery: SearchSuggestBoxProps['searchQuery'];
};

const SearchSuggestBoxFooter: FC<SearchSuggestBoxFooterProps> = ({
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
              navigateToSearchResults({ name: searchQuery });
            }}
          >
            {t('Search')}
          </Button>
          <Button
            data-test="results-advanced-search"
            icon={<AdvancedSearchIcon />}
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
