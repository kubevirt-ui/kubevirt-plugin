import { type FC } from 'react';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVirtIODriversAlert from '@kubevirt-utils/resources/vm/utils/virtio-drivers/useVirtIODriversAlert';
import { getOutdatedDriversAlertTitle } from '@kubevirt-utils/resources/vm/utils/virtio-drivers/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Alert, AlertActionCloseButton, AlertVariant, Flex } from '@patternfly/react-core';
import VirtIODriversDocLink from '@virtualmachines/list/components/VirtIODriversAlert/components/VirtIODriversDocLink';

import { buildOutdatedVirtioDriversPath } from './utils';

const VirtIODriversDownloadsAlert: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();

  const { setSessionDismissed, showAlert, vmsCount } = useVirtIODriversAlert();

  if (!showAlert) {
    return null;
  }

  const handleClose = (): void => {
    setSessionDismissed(true);
  };

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={handleClose} />}
      data-test="virtio-drivers-downloads-alert"
      isExpandable
      isInline
      title={getOutdatedDriversAlertTitle(vmsCount, t)}
      variant={AlertVariant.warning}
    >
      <p className="pf-v6-u-mt-xs">
        {t(
          'Older driver versions might cause issues after host upgrades. Update to the latest VirtIO drivers to help prevent compatibility issues.',
        )}
      </p>
      <Flex className="pf-v6-u-mt-sm">
        <Link to={buildOutdatedVirtioDriversPath(cluster)}>
          {t('View VMs with outdated drivers')}
        </Link>
        <VirtIODriversDocLink />
      </Flex>
    </Alert>
  );
};

export default VirtIODriversDownloadsAlert;
