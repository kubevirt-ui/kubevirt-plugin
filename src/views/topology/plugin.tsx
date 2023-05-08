import * as _ from 'lodash';

import { Plugin } from '@console/plugin-sdk';
import { ModelDefinition, ModelFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

import { defaultDecoratorsPlugin } from './components/graph-view/components/nodes/decorators/defaultDecoratorsPlugin';
import {
  OperatorsTopologyConsumedExtensions,
  operatorsTopologyPlugin,
} from './operators/operatorsTopologyPlugin';
import { TopologyDecoratorProvider } from './extensions';
import * as models from './models';

type ConsumedExtensions =
  | ModelDefinition
  | ModelFeatureFlag
  | TopologyDecoratorProvider
  | OperatorsTopologyConsumedExtensions;

const plugin: Plugin<ConsumedExtensions> = [
  {
    type: 'ModelDefinition',
    properties: {
      models: _.values(models),
    },
  },
  ...operatorsTopologyPlugin,
  ...defaultDecoratorsPlugin,
];

export default plugin;
