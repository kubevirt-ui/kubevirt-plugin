import React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { Bullseye, PageSection } from '@patternfly/react-core';

import './wizard-environment-tab.scss';

const WizardEnvironmentTab: WizardTab = ({ setDisableVmCreate, updateVM, vm }) => {
  if (!vm)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <PageSection className="wizard-environment-tab">
      <SidebarEditor<V1VirtualMachine>
        onChange={updateVM}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.ENV_TAB}
        resource={vm}
      >
        <EnvironmentForm onEditChange={setDisableVmCreate} updateVM={updateVM} vm={vm} />
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardEnvironmentTab;
