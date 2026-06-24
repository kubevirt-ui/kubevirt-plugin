import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Content, ContentVariants, MenuList } from '@patternfly/react-core';

import { DEFAULT_VISIBLE_EXAMPLES, getSearchExamples } from '../constants';

import SearchMenuItem from './SearchMenuItem';

type SearchExamplesProps = {
  focusedItemIndex: number;
  onSelectExample: (query: string) => void;
  onToggleShowAll: () => void;
  showAll: boolean;
};

const SearchExamples: FC<SearchExamplesProps> = ({
  focusedItemIndex,
  onSelectExample,
  onToggleShowAll,
  showAll,
}) => {
  const { t } = useKubevirtTranslation();

  const searchExamples = useMemo(() => getSearchExamples(t), [t]);

  const visibleExamples = useMemo(
    () => (showAll ? searchExamples : searchExamples.slice(0, DEFAULT_VISIBLE_EXAMPLES)),
    [showAll, searchExamples],
  );

  return (
    <div className="search-dropdown__section">
      <Content className="search-dropdown__section-title" component={ContentVariants.h6}>
        {t('Try an example')}
      </Content>
      <MenuList className="pf-v6-u-mx-sm">
        {visibleExamples.map(({ description, query }, index) => (
          <SearchMenuItem
            description={
              <>
                {'→ '}
                <code>{query}</code>
              </>
            }
            isFocused={index === focusedItemIndex}
            itemId={query}
            key={query}
            onClick={() => onSelectExample(query)}
          >
            {description}
          </SearchMenuItem>
        ))}
      </MenuList>
      {searchExamples.length > DEFAULT_VISIBLE_EXAMPLES && (
        <div className="search-dropdown__toggle-examples">
          <Button isInline onClick={onToggleShowAll} variant="link">
            {showAll ? t('Show fewer') : t('Show more examples')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchExamples;
