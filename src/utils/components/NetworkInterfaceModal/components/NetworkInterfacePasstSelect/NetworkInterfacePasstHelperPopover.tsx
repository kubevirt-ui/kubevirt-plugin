import { type FC } from 'react';
import { Link } from 'react-router';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSettingsURL } from '@settings/utils/urls';

type NetworkInterfacePasstHelperPopoverProps = {
  namespace?: string;
};

const NetworkInterfacePasstHelperPopover: FC<NetworkInterfacePasstHelperPopoverProps> = ({
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={() => (
        <div>
          {t(
            'To enable this feature, you need to enable the Passt feature flag in the cluster settings.',
          )}{' '}
          <Link to={getSettingsURL(namespace)}>{t('Go to cluster settings')}</Link>
        </div>
      )}
    />
  );
};
export default NetworkInterfacePasstHelperPopover;
