import type { FC } from 'react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import CreationMethodTileGroup from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/CreationMethodTileGroup';
import NameAndDescriptionForm from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/NameAndDescriptionForm/NameAndDescriptionForm';
import VMCreationLocationDisplay from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/VMCreationLocationDisplay';
import VMCreationLocationForm from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/VMCreationLocationForm';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

const DeploymentDetailsStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'creationMethod' });
  const [editCreationLocation, setEditCreationLocation] = useState(false);

  const isCloneMethod = isCloneCreationMethod(creationMethod);

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
      {!isCloneMethod && (
        <>
          <StackItem className="pf-v6-u-mt-md">
            <Title headingLevel="h1" size={TitleSizes.lg}>
              {t('General info')}
            </Title>
          </StackItem>
          <StackItem>
            <NameAndDescriptionForm />
          </StackItem>
        </>
      )}
      <StackItem className="pf-v6-u-mt-md">
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Location')}
        </Title>
      </StackItem>
      <StackItem>{t('Your VirtualMachine will be created in the following location')}</StackItem>
      <StackItem>
        <VMCreationLocationDisplay
          editCreationLocation={editCreationLocation}
          setEditCreationLocation={setEditCreationLocation}
        />
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
