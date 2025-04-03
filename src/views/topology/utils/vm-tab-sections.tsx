import { AdapterDataType, PodsAdapterDataType } from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import usePodsAdapterForVM from '../hooks/usePodsAdapterForVM';

import { TYPE_VIRTUAL_MACHINE } from './constants';
import { getResource } from './topology-utils';

export const getVMSidePanelPodsAdapter = (
  element: GraphElement,
): AdapterDataType<PodsAdapterDataType> => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return null;
  const resource = getResource(element);
  return { provider: usePodsAdapterForVM, resource };
};
