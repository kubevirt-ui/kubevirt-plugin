import React, { FC } from 'react';

import { Flex, FlexItem } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

import CreationMethodTile from './components/CreationMethodTile/CreationMethodTile';

import './CreationMethodTileGroup.scss';

const CreationMethodTileGroup: FC = () => {
  const { creationMethod, setCreationMethod } = useVMWizardStore();

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
              setSelectedCreationMethod={setCreationMethod}
            />
          </FlexItem>
        ),
      )}
    </Flex>
  );
};

export default CreationMethodTileGroup;
