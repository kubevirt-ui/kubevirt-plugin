import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Divider, PanelHeader } from '@patternfly/react-core';

import { SearchSuggestBoxProps } from '../SearchSuggestBox';

type SearchSuggestBoxHeaderProps = Pick<
  SearchSuggestBoxProps,
  'navigateToSearchResults' | 'searchQuery'
>;

const SearchSuggestBoxHeader: FC<SearchSuggestBoxHeaderProps> = ({
  navigateToSearchResults,
  searchQuery,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <PanelHeader>
        <Button
          onClick={() => {
            navigateToSearchResults({ name: searchQuery });
          }}
          size="sm"
          variant={ButtonVariant.link}
        >
          <strong>{t('All search results found for "{{searchQuery}}"', { searchQuery })}</strong>
        </Button>
      </PanelHeader>
      <Divider />
    </>
  );
};

export default SearchSuggestBoxHeader;
