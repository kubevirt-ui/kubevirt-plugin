import React, { FCC } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { VMCreationMethod } from '@virtualmachines/creation-wizard/utils/constants';

import CreationMethodTile from './components/CreationMethodTile/CreationMethodTile';

import './CreationMethodTileGroup.scss';

const CreationMethodTileGroup: FCC = () => {
  const { creationMethod, setCreationMethod } = useVMWizardStore();

  return (
    <Split
      className="pf-v6-u-justify-content-space-between vm-creation-method-tile-group"
      hasGutter
    >
      {[VMCreationMethod.INSTANCE_TYPE, VMCreationMethod.TEMPLATE, VMCreationMethod.CLONE].map(
        (method) => (
          <SplitItem key={method}>
            <CreationMethodTile
              creationMethod={method}
              isChecked={creationMethod === method}
              setSelectedCreationMethod={setCreationMethod}
            />
          </SplitItem>
        ),
      )}
    </Split>
  );
};

export default CreationMethodTileGroup;
