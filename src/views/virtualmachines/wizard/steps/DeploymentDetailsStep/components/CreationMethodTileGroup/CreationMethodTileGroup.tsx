import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import { Flex, FlexItem } from '@patternfly/react-core';
import { useVMWizardState } from '@virtualmachines/wizard/state/useVMWizardState';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { createInitialVMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardDeploymentValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import { clearVMPendingUploads } from '@virtualmachines/wizard/utils/utils';

import CreationMethodTile from './components/CreationMethodTile/CreationMethodTile';

import './CreationMethodTileGroup.scss';

const CreationMethodTileGroup: FC = () => {
  const { control, getValues, reset, setValue } = useVMWizard();
  const { resetState } = useVMWizardState();
  const creationMethod: VMCreationMethod = useWatch({
    control,
    name: 'creationMethod',
  });

  const handleCreationMethodChange = (selectedCreationMethod: VMCreationMethod): void => {
    if (selectedCreationMethod === creationMethod) {
      return;
    }

    const { cluster, description, folder, name, project }: Partial<VMWizardDeploymentValues> =
      getValues('deployment');

    clearVMPendingUploads(getValues, setValue);
    resetState();
    reset(
      createInitialVMWizardFormValues({
        cluster,
        creationMethod: selectedCreationMethod,
        description,
        folder,
        name,
        project,
      }),
    );
  };

  return (
    <Flex
      className="vm-creation-method-tile-group"
      flexWrap={{ default: 'wrap' }}
      gap={{ default: 'gapMd' }}
      justifyContent={{ default: 'justifyContentFlexStart' }}
    >
      {[VMCreationMethod.INSTANCE_TYPE, VMCreationMethod.TEMPLATE, VMCreationMethod.CLONE].map(
        (method) => (
          <FlexItem className="vm-creation-method-tile-group__item" key={method}>
            <CreationMethodTile
              creationMethod={method}
              isChecked={creationMethod === method}
              setSelectedCreationMethod={handleCreationMethodChange}
            />
          </FlexItem>
        ),
      )}
    </Flex>
  );
};

export default CreationMethodTileGroup;
