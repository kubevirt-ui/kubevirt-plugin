import React, { FC } from 'react';

import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { PageSection } from '@patternfly/react-core';

import { onSubmitYAML, updateAnnotation, updateLabels } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import MetadataTabContent from './components/MetadataTabContent';

import './metadata-tab.scss';

const MetadataTab: FC<ConfigurationInnerTabProps> = ({ vm }) => {
  if (!vm) return null;

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.DEFAULT}
      resource={vm}
    >
      <PageSection>
        <MetadataTabContent
          onAnnotationsSubmit={(annotations) => updateAnnotation(vm, annotations)}
          onLabelsSubmit={(labels) => updateLabels(vm, labels)}
          vm={vm}
        />
      </PageSection>
    </SidebarEditor>
  );
};

export default MetadataTab;
