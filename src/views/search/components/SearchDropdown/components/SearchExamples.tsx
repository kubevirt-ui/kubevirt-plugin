import React, { FC, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Content, ContentVariants } from '@patternfly/react-core';

import { DEFAULT_VISIBLE_EXAMPLES, getSearchExamples } from '../constants';

type SearchExamplesProps = {
  onSelectExample: (query: string) => void;
};

const SearchExamples: FC<SearchExamplesProps> = ({ onSelectExample }) => {
  const { t } = useKubevirtTranslation();
  const [showAll, setShowAll] = useState(false);

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
      <ul className="search-dropdown__list">
        {visibleExamples.map((example) => (
          <li key={example.query}>
            <button
              className="search-dropdown__item"
              onClick={() => onSelectExample(example.query)}
              type="button"
            >
              <div>{example.description}</div>
              <div className="search-dropdown__example-query">
                {'→ '}
                <code>{example.query}</code>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {searchExamples.length > DEFAULT_VISIBLE_EXAMPLES && (
        <div className="search-dropdown__toggle-examples">
          <Button isInline onClick={() => setShowAll((prev) => !prev)} variant="link">
            {showAll ? t('Show fewer') : t('Show more examples')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchExamples;
