import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const BootCDCheckboxLabel: React.FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('Boot from CD')}{' '}
      <Popover
        aria-label={'Help'}
        bodyContent={() => (
          <div>
            {t(
              'Boot from CD requires an image file i.e. ISO, qcow, etc. that will be mounted to the VM as a CD',
            )}
          </div>
        )}
      >
        <HelpIcon />
      </Popover>
    </>
  );
};

export default BootCDCheckboxLabel;
