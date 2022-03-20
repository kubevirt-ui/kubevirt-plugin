import * as React from 'react';
import { Link } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const SnapshotSupportLink: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Link
      to={
        'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.9/html/storage/using-container-storage-interface-csi#persistent-storage-csi-snapshots'
      }
    >
      {t('Learn more about snapshots')}
    </Link>
  );
};

export default SnapshotSupportLink;
