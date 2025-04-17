import React, { FC } from 'react';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const VirtualMachineSearchResults: FC = () => {
  const { t } = useKubevirtTranslation();

  return <div>{t('TODO VirtualMachineSearchResults')}</div>
};

export default VirtualMachineSearchResults;
