import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  AdapterDataType,
  getGroupVersionKindForResource,
  NetworkAdapterType,
  PodsAdapterDataType,
  ResourceIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { GraphElement } from '@patternfly/react-topology';

import { resourcePathFromModel } from '../../cdi-upload-provider/utils/utils';
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

export const getVMSidePanelNetworkAdapter = (element: GraphElement): NetworkAdapterType => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return undefined;
  const resource = getResource(element);
  return { resource };
};

export const getVMSideBarResourceLink = (element: GraphElement) => {
  if (element.getType() !== TYPE_VIRTUAL_MACHINE) return null;
  const name = element.getLabel();
  const resource = getResource(element);
  return (
    <>
      <ResourceIcon
        className="co-m-resource-icon--lg"
        groupVersionKind={getGroupVersionKindForResource(resource)}
      />
      {name && (
        <Link
          className="co-resource-item__resource-name"
          to={resourcePathFromModel(VirtualMachineModel, name, resource.metadata.namespace)}
        >
          {name}
        </Link>
      )}
    </>
  );
};
