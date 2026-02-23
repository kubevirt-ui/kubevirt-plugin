import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import CreationMethodTileGroup from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/CreationMethodTileGroup';
import VMCreationLocationDisplay from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/VMCreationLocationDisplay';
import VMCreationLocationForm from '@virtualmachines/creation-wizard/steps/DeploymentDetailsStep/components/VMCreationLocationForm';

const DeploymentDetailsStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const [editCreationLocation, setEditCreationLocation] = useState(false);

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Select a creation method')}
        </Title>
      </StackItem>
      <StackItem>
        <CreationMethodTileGroup />
      </StackItem>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Location')}
        </Title>
      </StackItem>
      <StackItem>
        {t(
          'Your VirtualMachine will be created in the location below based on your current view. Edit to change.',
        )}
      </StackItem>
      <StackItem>
        <VMCreationLocationDisplay setEditCreationLocation={setEditCreationLocation} />
      </StackItem>
      {editCreationLocation && (
        <StackItem>
          <VMCreationLocationForm />
        </StackItem>
      )}
    </Stack>
  );
};

export default DeploymentDetailsStep;
