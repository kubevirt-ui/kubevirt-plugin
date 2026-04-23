import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ProgressStatus } from '@openshift-console/dynamic-plugin-sdk';

const ClonePVCStatus: FC = () => {
  const { t } = useKubevirtTranslation();
  return <ProgressStatus title={t('Cloning')} />;
};

export default ClonePVCStatus;
