import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonProps, ButtonVariant, Divider, PanelFooter } from '@patternfly/react-core';
import SlidersHIcon from '@patternfly/react-icons/dist/esm/icons/sliders-h-icon';

export type SearchSuggestBoxFooterProps = {
  onAdvancedSearchClick: ButtonProps['onClick'];
};

const SearchSuggestBoxFooter: FC<SearchSuggestBoxFooterProps> = ({ onAdvancedSearchClick }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Divider />
      <PanelFooter className="pf-v6-u-py-md">
        <Button
          icon={<SlidersHIcon />}
          iconPosition="end"
          onClick={onAdvancedSearchClick}
          size="sm"
          variant={ButtonVariant.secondary}
        >
          {t('Advanced search')}
        </Button>
      </PanelFooter>
    </>
  );
};

export default SearchSuggestBoxFooter;
