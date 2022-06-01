import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, Title } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './VirtualMachineEnvironmentTabTitle.scss';

const VirtualMachineEnvironmentTabTitle: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Title headingLevel="h6" className="co-section-heading">
      <span>
        <h2 className="header-title-inline">
          {t('Include all values from existing config maps, secrets or service accounts (as Disk)')}{' '}
        </h2>
        <Popover
          aria-label={'Help'}
          bodyContent={t(
            'Add new values by referencing an existing config map, secret or service account. Using these values requires mounting them manually to the VM.',
          )}
        >
          <HelpIcon className="icon-size-small" />
        </Popover>
      </span>
    </Title>
  );
};

export default VirtualMachineEnvironmentTabTitle;
