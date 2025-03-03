import React, { FC } from 'react';

import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import SchedulingSection from './components/SchedulingSection';

const SchedulingTab: FC<ConfigurationInnerTabProps> = ({ instanceTypeVM, vm, vmi }) => (
  <SidebarEditor
    onResourceUpdate={onSubmitYAML}
    pathsToHighlight={PATHS_TO_HIGHLIGHT.SCHEDULING_TAB}
    resource={vm}
  >
    {(resource) => (
      <PageSection>
        <SchedulingSection instanceTypeVM={instanceTypeVM} vm={resource} vmi={vmi} />
      </PageSection>
    )}
  </SidebarEditor>
);

export default SchedulingTab;
