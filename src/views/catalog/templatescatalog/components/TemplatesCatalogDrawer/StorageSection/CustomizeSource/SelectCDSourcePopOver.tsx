import React, { FCC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const SelectCDSourcePopOver: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={t(
        'CD source represents the source for our disk, this can be HTTP, Registry or an existing PVC',
      )}
    />
  );
};

export default SelectCDSourcePopOver;
