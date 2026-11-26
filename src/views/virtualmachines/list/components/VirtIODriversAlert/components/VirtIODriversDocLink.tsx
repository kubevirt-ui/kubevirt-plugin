import { type FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const VirtIODriversDocLink: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExternalLink
      href={documentationURL.VIRTIO_WIN_DRIVERS}
      text={t('How to update Windows VMs')}
    />
  );
};

export default VirtIODriversDocLink;
