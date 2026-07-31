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
  crPlural: string;
  enableAnnotation?: string;
  operatorPackageName: string;
  recommendedYAML: string;
};

export const AUTOPILOT_REGISTRY: AutopilotRegistryEntry[] = [
  {
    crGVK: KubeDeschedulerGVK,
    crName: 'cluster',
    crNamespace: 'openshift-kube-descheduler-operator',
    crPlural: 'kubedeschedulers',
    operatorPackageName: DESCHEDULER_OPERATOR_PACKAGE,
    recommendedYAML: KUBE_DESCHEDULER_RECOMMENDED_YAML,
  },
  {
    crGVK: MetalLBGVK,
    crName: 'metallb',
    crNamespace: 'metallb-system',
    crPlural: 'metallbs',
    enableAnnotation: 'platform.kubevirt.io/enable-metallb',
    operatorPackageName: METALLB_OPERATOR_NAME,
    recommendedYAML: METALLB_RECOMMENDED_YAML,
  },
  {
    crGVK: ForkliftControllerGVK,
    crName: 'forklift-controller',
    crNamespace: 'openshift-mtv',
    crPlural: 'forkliftcontrollers',
    enableAnnotation: 'platform.kubevirt.io/enable-mtv',
    operatorPackageName: MTV_OPERATOR_NAME,
    recommendedYAML: FORKLIFT_CONTROLLER_RECOMMENDED_YAML,
  },
  {
    crGVK: UIPluginGVK,
    crName: 'monitoring',
    crPlural: 'uiplugins',
    operatorPackageName: CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE,
    recommendedYAML: UI_PLUGIN_RECOMMENDED_YAML,
  },
  {
    crGVK: LokiStackGVK,
    crName: 'logging-loki',
    crNamespace: 'openshift-logging',
    crPlural: 'lokistacks',
    enableAnnotation: 'platform.kubevirt.io/enable-logging',
    operatorPackageName: LOKI_OPERATOR_NAME,
    recommendedYAML: LOKI_STACK_RECOMMENDED_YAML,
  },
  {
    crGVK: ClusterLogForwarderGVK,
    crName: 'instance',
    crNamespace: 'openshift-logging',
    crPlural: 'clusterlogforwarders',
    enableAnnotation: 'platform.kubevirt.io/enable-logging',
    operatorPackageName: CLUSTER_LOGGING_OPERATOR_NAME,
    recommendedYAML: CLUSTER_LOG_FORWARDER_RECOMMENDED_YAML,
  },
];
