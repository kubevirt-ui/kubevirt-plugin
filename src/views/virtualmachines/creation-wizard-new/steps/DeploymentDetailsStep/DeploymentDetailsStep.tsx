import React, { FC, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import CreationMethodTileGroup from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/CreationMethodTileGroup/CreationMethodTileGroup';
import NameAndDescriptionForm from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/NameAndDescriptionForm/NameAndDescriptionForm';
import VMCreationLocationDisplay from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/VMCreationLocationDisplay';
import VMCreationLocationForm from '@virtualmachines/creation-wizard-new/steps/DeploymentDetailsStep/components/VMCreationLocationForm';
import { isCloneCreationMethod } from '@virtualmachines/creation-wizard-new/utils/utils';

const DeploymentDetailsStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const creationMethod = useWatch({ control, name: 'vmData.creationMethod' });
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
