import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { MenuFooter } from '@patternfly/react-core';

const SearchDropdownFooter: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <MenuFooter className="search-dropdown__footer">
      <div className="search-dropdown__footer-group">
        <span>
          <kbd>,</kbd> {t('= OR')}
        </span>
        <span className="search-dropdown__footer-separator">·</span>
        <span>
          <kbd>-</kbd> {t('to exclude')}
        </span>
        <span className="search-dropdown__footer-separator">·</span>
        <span>
          <kbd>{t('Space')}</kbd> {t('to commit')}
        </span>
      </div>
      <div className="search-dropdown__footer-group">
        <span>
          <kbd>{t('Enter')}</kbd> / <kbd>{t('Tab')}</kbd> {t('to select')}
        </span>
        <span className="search-dropdown__footer-separator">·</span>
        <span>
          <kbd>↑↓</kbd> {t('navigate')}
        </span>
        <span className="search-dropdown__footer-separator">·</span>
        <span>
          <kbd>{t('Esc')}</kbd> {t('to close')}
        </span>
      </div>
    </MenuFooter>
  );
};

export default SearchDropdownFooter;
