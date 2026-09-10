import type { FC } from 'react';
import React from 'react';

import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import type { ConfigurationInnerTabProps } from '../utils/types';
import DetailsSection from './DetailsSection';
import { onSubmitYAML } from './utils/utils';

const DetailsTab: FC<ConfigurationInnerTabProps> = ({
  allInstanceTypes,
  instanceTypeVM,
  vm,
  vmi,
}) => (
  <SidebarEditor
    onResourceUpdate={onSubmitYAML}
    pathsToHighlight={PATHS_TO_HIGHLIGHT.DETAILS_TAB}
    resource={vm}
  >
    {(resource) => (
      <PageSection>
        <DetailsSection
          allInstanceTypes={allInstanceTypes}
          instanceTypeVM={instanceTypeVM}
          vm={resource}
          vmi={vmi}
        />
      </PageSection>
    )}
  </SidebarEditor>
);

export default DetailsTab;
