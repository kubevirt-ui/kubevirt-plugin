import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import OperatingSystemTileGroup from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/OperatingSystemTileGroup/OperatingSystemTileGroup';
import PreferenceSelectMenu from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/components/PreferenceSelectMenu/PreferenceSelectMenu';

const GuestOSStep: FCC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Guest operating system')}
        </Title>
      </StackItem>
      <StackItem>
        {t(
          'Choose your OS to ensure the best compatibility and system stability for your VirtualMachine.',
        )}
      </StackItem>
      <StackItem>
        <OperatingSystemTileGroup />
      </StackItem>
      <StackItem className="pf-v6-u-mt-lg">
        <PreferenceSelectMenu />
      </StackItem>
    </Stack>
  );
};

export default GuestOSStep;
