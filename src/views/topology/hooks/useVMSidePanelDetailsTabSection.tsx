/* eslint-disable @eslint-react/no-unnecessary-use-prefix */
import React from 'react';

import { type DetailsTabSectionExtensionHook } from '@openshift-console/dynamic-plugin-sdk';
import { type GraphElement } from '@patternfly/react-topology';
import { isVMType } from '@topology/utils/utils';

import TopologyVMDetailsPanel from '../components/vm/VMDetailsPanel/TopologyVMDetailsPanel';
import { type VMNode } from '../utils/types/types';

const useVMSidePanelDetailsTabSection: DetailsTabSectionExtensionHook = (element: GraphElement) => {
  if (!isVMType(element.getType())) {
    return [undefined, true, undefined];
  }
  const section = <TopologyVMDetailsPanel vmNode={element as VMNode} />;
  return [section, true, undefined];
};

export default useVMSidePanelDetailsTabSection;
