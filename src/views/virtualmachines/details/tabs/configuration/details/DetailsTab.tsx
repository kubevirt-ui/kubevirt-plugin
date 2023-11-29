import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import { onSubmitYAML } from './utils/utils';
import DetailsSection from './DetailsSection';

type DetailsTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsTab: FC<DetailsTabProps> = ({ obj: vm, vmi }) => {
  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
      resource={vm}
    >
      {(resource) => (
        <PageSection>
          <DetailsSection vm={resource} vmi={vmi} />
        </PageSection>
      )}
    </SidebarEditor>
  );
};

export default DetailsTab;
