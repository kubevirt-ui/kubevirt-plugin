import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, MenuFooter } from '@patternfly/react-core';

const SearchDropdownFooter: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <MenuFooter className="search-dropdown__footer">
      <span>
        <kbd>,</kbd> {t('OR')}
      </span>
      <span>
        <kbd>-</kbd> {t('exclude')}
      </span>
      <span>
        <kbd>{t('Space')}</kbd> {t('apply, keep open')}
      </span>
      <span>
        <kbd>{t('Enter')}</kbd> {t('apply, close')}
      </span>
      <Divider orientation={{ default: 'vertical' }} />
      <span>
        <kbd>↑↓</kbd> {t('navigate')}
      </span>
      <span>
        <kbd>{t('Tab')}</kbd> / <kbd>{t('Enter')}</kbd> {t('select')}
      </span>
      <span>
        <kbd>{t('Esc')}</kbd> {t('close')}
      </span>
    </MenuFooter>
  );
};

export default SearchDropdownFooter;
