import { type FC } from 'react';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { getFleetSettingsURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { DOWNLOADS_TAB_IDS } from '@settings/search/constants';
import { SETTINGS_TABS } from '@settings/tabs';
import { getSettingsURL } from '@settings/utils/urls';

const VirtIODownloadsSettingsLink: FC = () => {
  const { t } = useKubevirtTranslation();
  const namespace = useNamespaceParam();
  const isACMPage = useIsACMPage();

  const settingsBaseURL = isACMPage ? getFleetSettingsURL() : getSettingsURL(namespace);
  const settingsURL = `${settingsBaseURL}/${SETTINGS_TABS.DOWNLOADS}#${DOWNLOADS_TAB_IDS.virtioDriversWindows}`;

  return <Link to={settingsURL}>{t('Get updated drivers')}</Link>;
};

export default VirtIODownloadsSettingsLink;
