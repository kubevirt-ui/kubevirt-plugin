import * as React from 'react';

import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, Title } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const EnvironmentFormTitle: React.FC = React.memo(() => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <SidebarEditorSwitch />
      <Title headingLevel="h2" className="co-section-heading">
        <span>
          {t('Include all values from existing config maps, secrets or service accounts (as disk)')}{' '}
          <Popover
            aria-label={'Help'}
            bodyContent={() => (
              <div>
                {t(
                  'Add new values by referencing an existing config map, secret or service account. Using these values requires mounting them manually to the VM.',
                )}
              </div>
            )}
          >
            <HelpIcon />
          </Popover>
        </span>
      </Title>
    </>
  );
});
EnvironmentFormTitle.displayName = 'EnvironmentFormTitle';

export default EnvironmentFormTitle;
