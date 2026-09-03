import React, { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import { Flex, FlexItem } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_VM_DATA,
  createInitialVMWizardFormValues,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { type VMWizardVirtualMachineData } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import { clearVMPendingUploadsAndSignal } from '@virtualmachines/wizard/utils/utils';

import CreationMethodTile from './components/CreationMethodTile/CreationMethodTile';

import './CreationMethodTileGroup.scss';

const CreationMethodTileGroup: FC = () => {
  const { control, getValues, reset } = useVMWizard();
  const creationMethod: VMCreationMethod = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD,
  });

  const handleCreationMethodChange = (selectedCreationMethod: VMCreationMethod): void => {
    if (selectedCreationMethod === creationMethod) {
      return;
    }

    const { cluster, description, folder, name, project }: Partial<VMWizardVirtualMachineData> =
      getValues(CREATE_VM_FORM_FIELDS_VM_DATA.ROOT);

    clearVMPendingUploadsAndSignal();
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
