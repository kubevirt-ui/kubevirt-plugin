import React, { FC, memo } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Title } from '@patternfly/react-core';

type EnvironmentFormTitleProps = {
  displayYAMLSwitcher?: boolean;
};

const EnvironmentFormTitle: FC<EnvironmentFormTitleProps> = memo(
  ({ displayYAMLSwitcher = false }) => {
    const { t } = useKubevirtTranslation();

    return (
      <>
        <Title headingLevel="h2">
          <Flex>
            <FlexItem>{t('Environment')}</FlexItem>
            {displayYAMLSwitcher && (
              <FlexItem>
                <SidebarEditorSwitch />
              </FlexItem>
            )}
          </Flex>
        </Title>
        {t('Include all values from existing config maps, secrets or service accounts (as disk)')}{' '}
        <HelpTextIcon
          bodyContent={t(
            'Add new values by referencing an existing config map, secret or service account. Using these values requires mounting them manually to the VM.',
          )}
        />
      </>
    );
  },
);
EnvironmentFormTitle.displayName = 'EnvironmentFormTitle';

export default EnvironmentFormTitle;
