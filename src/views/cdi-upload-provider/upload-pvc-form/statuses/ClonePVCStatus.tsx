import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ProgressStatus } from '@openshift-console/dynamic-plugin-sdk';

const ClonePVCStatus: React.FCC = () => {
  const { t } = useKubevirtTranslation();
  return <ProgressStatus title={t('Cloning')} />;
};

export default ClonePVCStatus;
