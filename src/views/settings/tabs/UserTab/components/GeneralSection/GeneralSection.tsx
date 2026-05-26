import React, { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { USER_TAB_IDS } from '@settings/search/constants';
import { AUTO_HIDE_NAV_DEFAULT } from '@virtualmachines/hooks/useAutoHideNavigation/constants';

const GeneralSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [navigation, setNavigation] = useKubevirtUserSettings(USER_SETTINGS_KEYS.navigation);

  const isChecked = navigation?.autoHideNav ?? AUTO_HIDE_NAV_DEFAULT;

  return (
    <ExpandSection
      dataTestID="settings-user-general"
      searchItemId={USER_TAB_IDS.general}
      toggleText={t('General')}
    >
      <SectionWithSwitch
        helpTextIconContent={t(
          'Automatically collapse the side navigation when managing your virtual machines to maximize your workspace',
        )}
        title={
          <SearchItem id={USER_TAB_IDS.autoHideNav}>{t('Auto-hide navigation menu')}</SearchItem>
        }
        dataTestID="auto-hide-nav"
        id={USER_TAB_IDS.autoHideNav}
        switchIsOn={isChecked}
        turnOnSwitch={(checked) => setNavigation({ ...navigation, autoHideNav: checked })}
      />
    </ExpandSection>
  );
};

export default GeneralSection;
