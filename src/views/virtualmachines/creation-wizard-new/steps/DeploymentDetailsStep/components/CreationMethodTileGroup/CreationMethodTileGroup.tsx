import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { Flex, FlexItem } from '@patternfly/react-core';

import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import { VMCreationMethod } from '@virtualmachines/creation-wizard-new/utils/constants';

import CreationMethodTile from './components/CreationMethodTile/CreationMethodTile';

import './CreationMethodTileGroup.scss';

const CreationMethodTileGroup: FC = () => {
  const { control, setValue } = useVMWizard();
  const creationMethod = useWatch({ control, name: CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD });

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
              setSelectedCreationMethod={(selectedCreationMethod) =>
                setValue(CREATE_VM_FORM_FIELDS_VM_DATA.CREATION_METHOD, selectedCreationMethod)
              }
              creationMethod={method}
              isChecked={creationMethod === method}
            />
          </FlexItem>
        ),
      )}
    </Flex>
  );
};

export default CreationMethodTileGroup;
