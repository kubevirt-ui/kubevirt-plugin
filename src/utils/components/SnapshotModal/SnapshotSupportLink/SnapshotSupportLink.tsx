import * as React from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const SnapshotSupportLink: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <a href={documentationURL.SNAPSHOT} rel="noreferrer" target="_blank">
      {t('Learn more about snapshots')}
    </a>
  );
};

export default SnapshotSupportLink;
