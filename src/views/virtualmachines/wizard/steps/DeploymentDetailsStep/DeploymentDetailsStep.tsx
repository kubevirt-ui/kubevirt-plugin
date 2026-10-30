import type { FC } from 'react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import CreationMethodTileGroup from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/CreationMethodTileGroup';
import NameAndDescriptionForm from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/NameAndDescriptionForm/NameAndDescriptionForm';
import VMCreationLocationDisplay from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/VMCreationLocationDisplay';
import VMCreationLocationForm from '@virtualmachines/wizard/steps/DeploymentDetailsStep/components/VMCreationLocationForm';
import { isCloneCreationMethod } from '@virtualmachines/wizard/utils/utils';

const DeploymentDetailsStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizardForm();
  const [creationMethod, project] = useWatch({
    control,
    name: ['creationMethod', 'deployment.project'],
  });
  const needsProjectSelection = isEmpty(project);
  const [editCreationLocation, setEditCreationLocation] = useState(needsProjectSelection);

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
      <StackItem>
        {needsProjectSelection
          ? t(
              'Select a project or create a new one before continuing. Your VirtualMachine will be created in the selected location.',
            )
          : t('Your VirtualMachine will be created in the following location')}
      </StackItem>
      {!editCreationLocation && (
        <StackItem>
          <VMCreationLocationDisplay
            editCreationLocation={editCreationLocation}
            setEditCreationLocation={setEditCreationLocation}
          />
        </StackItem>
      )}
      {editCreationLocation && (
        <StackItem>
          <VMCreationLocationForm />
        </StackItem>
      )}
    </Stack>
  );
};

export default DeploymentDetailsStep;
