import React, { FCC } from 'react';
import { Link } from 'react-router';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

interface NetworkInterfacePasstHelperPopoverProps {
  namespace?: string;
}

const NetworkInterfacePasstHelperPopover: FCC<NetworkInterfacePasstHelperPopoverProps> = ({
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
          <Link to={`/k8s/ns/${namespace}/${VIRTUALIZATION_PATHS.SETTINGS}`}>
            {t('Go to cluster settings')}
          </Link>
        </div>
      )}
    />
  );
};
export default NetworkInterfacePasstHelperPopover;
