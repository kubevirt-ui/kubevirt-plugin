import React from 'react';

import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';
import { isVMType } from '@topology/utils/utils';

import TopologyVMDetailsPanel from '../components/vm/VMDetailsPanel/TopologyVMDetailsPanel';
import { VMNode } from '../utils/types/types';

const useVMSidePanelDetailsTabSection: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  if (isVMType(element.getType())) {
    return [undefined, true, undefined];
  }
  const section = <TopologyVMDetailsPanel vmNode={element as VMNode} />;
  return [section, true, undefined];
};

export default useVMSidePanelDetailsTabSection;
