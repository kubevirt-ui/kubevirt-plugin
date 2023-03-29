import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import WizardOverviewGrid from './components/WizardOverviewGrid';

import './WizardOverviewTab.scss';

const WizardOverviewTab: WizardTab = ({ vm, tabsData, updateVM }) => (
  <PageSection className="wizard-overview-tab">
    <SidebarEditor
      resource={vm}
      onResourceUpdate={(newVM) => updateVM(newVM)}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
    >
      {(resource) => (
        <>
          <SidebarEditorSwitch />
          <WizardOverviewGrid vm={resource} tabsData={tabsData} updateVM={updateVM} />
        </>
      )}
    </SidebarEditor>
  </PageSection>
);

export default WizardOverviewTab;
