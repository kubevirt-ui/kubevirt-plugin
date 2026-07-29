import { type K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';

import {
  CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE,
  ClusterLogForwarderGVK,
  DESCHEDULER_OPERATOR_PACKAGE,
  ForkliftControllerGVK,
  KubeDeschedulerGVK,
  LokiStackGVK,
  MetalLBGVK,
  UIPluginGVK,
} from './autopilotConstants';
import {
  CLUSTER_LOG_FORWARDER_RECOMMENDED_YAML,
  FORKLIFT_CONTROLLER_RECOMMENDED_YAML,
  KUBE_DESCHEDULER_RECOMMENDED_YAML,
  LOKI_STACK_RECOMMENDED_YAML,
  METALLB_RECOMMENDED_YAML,
  UI_PLUGIN_RECOMMENDED_YAML,
} from './autopilotRecommendedYaml';
import {
  CLUSTER_LOGGING_OPERATOR_NAME,
  LOKI_OPERATOR_NAME,
  METALLB_OPERATOR_NAME,
  MTV_OPERATOR_NAME,
} from './operatorNames';

export type AutopilotRegistryEntry = {
  crGVK: K8sGroupVersionKind;
  crName: string;
  crNamespace?: string;
  operatorPackageName: string;
  recommendedYAML: string;
};

export const AUTOPILOT_REGISTRY: AutopilotRegistryEntry[] = [
  {
    crGVK: KubeDeschedulerGVK,
    crName: 'cluster',
    crNamespace: 'openshift-kube-descheduler-operator',
    operatorPackageName: DESCHEDULER_OPERATOR_PACKAGE,
    recommendedYAML: KUBE_DESCHEDULER_RECOMMENDED_YAML,
  },
  {
    crGVK: MetalLBGVK,
    crName: 'metallb',
    crNamespace: 'metallb-system',
    operatorPackageName: METALLB_OPERATOR_NAME,
    recommendedYAML: METALLB_RECOMMENDED_YAML,
  },
  {
    crGVK: ForkliftControllerGVK,
    crName: 'forklift-controller',
    crNamespace: 'openshift-mtv',
    operatorPackageName: MTV_OPERATOR_NAME,
    recommendedYAML: FORKLIFT_CONTROLLER_RECOMMENDED_YAML,
  },
  {
    crGVK: UIPluginGVK,
    crName: 'monitoring',
    operatorPackageName: CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE,
    recommendedYAML: UI_PLUGIN_RECOMMENDED_YAML,
  },
  {
    crGVK: LokiStackGVK,
    crName: 'logging-loki',
    crNamespace: 'openshift-logging',
    operatorPackageName: LOKI_OPERATOR_NAME,
    recommendedYAML: LOKI_STACK_RECOMMENDED_YAML,
  },
  {
    crGVK: ClusterLogForwarderGVK,
    crName: 'collector',
    crNamespace: 'openshift-logging',
    operatorPackageName: CLUSTER_LOGGING_OPERATOR_NAME,
    recommendedYAML: CLUSTER_LOG_FORWARDER_RECOMMENDED_YAML,
  },
];
