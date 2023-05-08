import { applyCodeRefSymbol } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/coderefs/coderef-resolver';

import { ALLOW_SERVICE_BINDING_FLAG, INCONTEXT_ACTIONS_SERVICE_BINDING } from '../const';
import {
  TopologyComponentFactory,
  TopologyCreateConnector,
  TopologyDataModelFactory,
  TopologyDisplayFilters,
} from '../extensions';
import { doContextualBinding } from '../utils';

import { getCreateConnector } from './actions';
import {
  applyDisplayOptions,
  getDataModelReconciler,
  getOperatorsComponentFactory,
  getOperatorTopologyDataModel,
  getTopologyFilters,
} from './index';
import {
  getOperatorWatchedResources,
  getServiceBindingWatchedResources,
} from './operatorResources';

export type OperatorsTopologyConsumedExtensions =
  | TopologyComponentFactory
  | TopologyDataModelFactory
  | TopologyCreateConnector
  | TopologyDisplayFilters
  | PostFormSubmissionAction;

export const operatorsTopologyPlugin: Plugin<OperatorsTopologyConsumedExtensions> = [
  {
    type: 'Topology/ComponentFactory',
    properties: {
      getFactory: applyCodeRefSymbol(getOperatorsComponentFactory),
    },
  },
  {
    type: 'Topology/DataModelFactory',
    properties: {
      id: 'operator-topology-model-factory',
      priority: 500,
      getDataModel: applyCodeRefSymbol(getOperatorTopologyDataModel),
      resources: getOperatorWatchedResources,
      getDataModelReconciler: applyCodeRefSymbol(getDataModelReconciler),
    },
  },
  {
    type: 'Topology/DataModelFactory',
    properties: {
      id: 'service-binding-topology-model-factory',
      priority: 501,
      resources: getServiceBindingWatchedResources,
    },
    flags: {
      required: [ALLOW_SERVICE_BINDING_FLAG],
    },
  },
  {
    type: 'Topology/CreateConnector',
    properties: {
      getCreateConnector: applyCodeRefSymbol(getCreateConnector),
    },
    flags: {
      required: [ALLOW_SERVICE_BINDING_FLAG],
    },
  },
  {
    type: 'Topology/DisplayFilters',
    properties: {
      getTopologyFilters: applyCodeRefSymbol(getTopologyFilters),
      applyDisplayOptions: applyCodeRefSymbol(applyDisplayOptions),
    },
  },
  {
    type: 'PostFormSubmissionAction',
    properties: {
      type: INCONTEXT_ACTIONS_SERVICE_BINDING,
      callback: doContextualBinding,
    },
    flags: {
      required: [ALLOW_SERVICE_BINDING_FLAG],
    },
  },
];
