import React from 'react';

import { ActionServiceProvider } from '@openshift-console/dynamic-plugin-sdk';
import { Graph, isGraph, Node } from '@patternfly/react-topology';

import { createContextMenuItems } from '../../../actions/contextMenuActions';
import { TYPE_APPLICATION_GROUP } from '../../../const';

export const isWorkloadRegroupable = (node: Node): boolean =>
  isGraph(node?.getParent()) || node?.getParent().getType() === TYPE_APPLICATION_GROUP;

export const groupContextMenu = (element: Node, connectorSource?: Node) => [
  <ActionServiceProvider
    key="topology"
    context={{ 'topology-context-actions': { element, connectorSource } }}
  >
    {({ options, loaded }) => loaded && createContextMenuItems(options)}
  </ActionServiceProvider>,
];

export const graphContextMenu = (graph: Graph, connectorSource?: Node) => [
  <ActionServiceProvider
    key="topology"
    context={{ 'topology-context-actions': { element: graph, connectorSource } }}
  >
    {({ options, loaded }) => loaded && createContextMenuItems(options)}
  </ActionServiceProvider>,
];
