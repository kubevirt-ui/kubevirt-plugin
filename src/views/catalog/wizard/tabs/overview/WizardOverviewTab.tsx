import React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import WizardOverviewGrid from './components/WizardOverviewGrid';

import './WizardOverviewTab.scss';

const WizardOverviewTab: WizardTab = ({ tabsData, updateVM, vm }) => (
  <PageSection className="wizard-overview-tab">
    <SidebarEditor
      onResourceUpdate={(newVM) => updateVM(newVM)}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
      resource={vm}
    >
      {(resource) => <WizardOverviewGrid tabsData={tabsData} updateVM={updateVM} vm={resource} />}
    </SidebarEditor>
  </PageSection>
);

export default WizardOverviewTab;
