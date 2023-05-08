import React from 'react';

import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import { TYPE_APPLICATION_GROUP } from '../../const';

import TopologyApplicationResources from './TopologyApplicationResources';

const useApplicationPanelResourceTabSection: DetailsTabSectionExtensionHook = (
  element: GraphElement,
) => {
  if (element.getType() !== TYPE_APPLICATION_GROUP) {
    return [undefined, true, undefined];
  }
  const section = (
    <TopologyApplicationResources
      resources={element.getData().groupResources}
      group={element.getLabel()}
    />
  );
  return [section, true, undefined];
};

export default useApplicationPanelResourceTabSection;
