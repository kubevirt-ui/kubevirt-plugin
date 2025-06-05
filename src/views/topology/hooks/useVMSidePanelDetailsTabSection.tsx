import React from 'react';

import { DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import TopologyVMDetailsPanel from '../components/vm/VMDetailsPanel/TopologyVMDetailsPanel';
import { TYPE_VIRTUAL_MACHINE } from '../utils/constants';
import { VMNode } from '../utils/types/types';

const useVMSidePanelDetailsTabSection: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) {
    return [undefined, true, undefined];
  }
  const section = <TopologyVMDetailsPanel vmNode={element as VMNode} />;
  return [section, true, undefined];
};

export default useVMSidePanelDetailsTabSection;
