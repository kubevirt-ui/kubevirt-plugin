import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const AddVolumeContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Trans t={t}>
      When selecting a DataSource that your virtual machines can boot from, you can add a volume
      that is not listed by clicking the <b>Add volume</b> button.
    </Trans>
  );
};

export default AddVolumeContent;
