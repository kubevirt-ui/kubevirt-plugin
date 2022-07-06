import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Bullseye } from '@patternfly/react-core';

const WizardEnvironmentTab: WizardTab = ({ vm, updateVM, setDisableVmCreate }) => {
  if (!vm)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <div className="co-m-pane__body">
      <EnvironmentForm vm={vm} onEditChange={setDisableVmCreate} updateVM={updateVM} />
    </div>
  );
};

export default WizardEnvironmentTab;
