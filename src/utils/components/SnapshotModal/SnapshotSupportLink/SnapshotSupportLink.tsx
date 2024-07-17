import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const SnapshotSupportLink: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <a
      href={
        'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.10/html/storage/using-container-storage-interface-csi#persistent-storage-csi-snapshots'
      }
      rel="noreferrer"
      target="_blank"
    >
      {t('Learn more about snapshots')}
    </a>
  );
};

export default SnapshotSupportLink;
