import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Form/form';

interface NetworkInterfacePasstHelperPopoverProps {
  namespace?: string;
}

const NetworkInterfacePasstHelperPopover: FC<NetworkInterfacePasstHelperPopoverProps> = ({
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={() => (
        <div>
          {t(
            'To enable this feature, you need to enable the Passt feature flag in the cluster settings.',
          )}

          <Link to={`/k8s/ns/${namespace}/virtualization-overview/settings`}>
            {t('Go to cluster settings')}
          </Link>
        </div>
      )}
      aria-label={'Help'}
    >
      <Button
        className={styles.formGroupLabelHelp}
        icon={<HelpIcon />}
        variant={ButtonVariant.plain}
      />
    </Popover>
  );
};
export default NetworkInterfacePasstHelperPopover;
