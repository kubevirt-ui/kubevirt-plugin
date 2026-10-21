import type { FC } from 'react';

import useVirtIODriversAlert from '@kubevirt-utils/resources/vm/utils/virtio-drivers/useVirtIODriversAlert';
import { Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

const DownloadsTabWarningIcon: FC = () => {
  const { showAlert } = useVirtIODriversAlert();

  if (!showAlert) return null;

  return (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  );
};

export default DownloadsTabWarningIcon;
