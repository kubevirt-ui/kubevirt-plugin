import React from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { CardTitle, PopoverPosition } from '@patternfly/react-core';

const VirtualMachinesOverviewTabFilesystemTitle = () => {
  const { t } = useKubevirtTranslation();

  return (
    <CardTitle className="pf-v6-u-text-color-subtle">
      {t('File systems')}
      <HelpTextIcon
        bodyContent={(hide) => (
          <LightspeedSimplePopoverContent
            content={t(
              'The following information regarding how the disks are partitioned is provided by the guest agent.',
            )}
            hide={hide}
            promptType={OLSPromptType.FILE_SYSTEMS}
          />
        )}
        helpIconClassName="pf-v6-u-ml-xs"
        position={PopoverPosition.right}
      />
    </CardTitle>
  );
};

export default VirtualMachinesOverviewTabFilesystemTitle;
