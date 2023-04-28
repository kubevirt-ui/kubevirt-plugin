import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Bullseye, PageSection } from '@patternfly/react-core';

import './wizard-environment-tab.scss';

const WizardEnvironmentTab: WizardTab = ({ vm, updateVM, setDisableVmCreate }) => {
  if (!vm)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <PageSection className="wizard-environment-tab">
      <EnvironmentForm
        vm={vm}
        onEditChange={setDisableVmCreate}
        updateVM={updateVM}
        displayYAMLSwitcher
      />
    </PageSection>
  );
};

export default WizardEnvironmentTab;
