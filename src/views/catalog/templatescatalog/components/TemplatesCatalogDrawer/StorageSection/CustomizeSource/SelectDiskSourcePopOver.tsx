import React, { FCC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';

const SelectDiskSourcePopOver: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={t(
            'Disk Source represents the source for our disk, this can be HTTP, Registry or an existing PVC',
          )}
          hide={hide}
          promptType={OLSPromptType.DISK_SOURCE}
        />
      )}
    />
  );
};

export default SelectDiskSourcePopOver;
