import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Divider,
  PanelMainBody,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { SearchSuggestBoxProps } from '../SearchSuggestBox';

type RelatedSuggestions = Pick<
  SearchSuggestBoxProps,
  'searchQuery' | 'searchSuggestResult' | 'showSearchModal'
>;

const RelatedSuggestions: FC<RelatedSuggestions> = ({
  searchQuery,
  searchSuggestResult,
  showSearchModal,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Divider />
      <PanelMainBody>
        <Stack hasGutter>
          <StackItem>
            <strong>{t('Related suggestions')}</strong>
          </StackItem>
          {Object.entries(searchSuggestResult.resourcesMatching)
            .filter(([, count]) => count > 0)
            .map(([field, count]) => (
              <StackItem key={field}>
                {field === 'description' && t('Description')}
                {field === 'ip' && t('IP')}
                {field === 'labels' && t('Labels')}
                <Button
                  onClick={() => {
                    showSearchModal(
                      field === 'labels'
                        ? { labelInputText: searchQuery }
                        : { [field]: searchQuery },
                    );
                  }}
                  size="sm"
                  variant={ButtonVariant.link}
                >
                  {t('({{count}})', { count })}
                </Button>
              </StackItem>
            ))}
        </Stack>
      </PanelMainBody>
    </>
  );
};

export default RelatedSuggestions;
