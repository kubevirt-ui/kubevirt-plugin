import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import WizardSchedulingGrid from './components/WizardSchedulingGrid';

import './wizard-scheduling-tab.scss';

const WizardSchedulingTab: WizardTab = ({ updateVM, vm }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <SidebarEditor<V1VirtualMachine>
        onResourceUpdate={updateVM}
        pathsToHighlight={PATHS_TO_HIGHLIGHT.SCHEDULING_TAB}
        resource={vm}
      >
        {(resource) => <WizardSchedulingGrid updateVM={updateVM} vm={resource} />}
      </SidebarEditor>
    </PageSection>
  );
};

export default WizardSchedulingTab;
