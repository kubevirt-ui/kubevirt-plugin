import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

import {
  CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE,
  ClusterLogForwarderModel,
  DESCHEDULER_OPERATOR_PACKAGE,
  ForkliftControllerModel,
  KubeDeschedulerModel,
  LokiStackModel,
  MetalLBModel,
  UIPluginModel,
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
  crModel: K8sModel;
  crName: string;
  crNamespace?: string;
  enableAnnotation?: string;
  operatorPackageName: string;
  recommendedYAML: string;
};

export const AUTOPILOT_REGISTRY: AutopilotRegistryEntry[] = [
  {
    crModel: KubeDeschedulerModel,
    crName: 'cluster',
    crNamespace: 'openshift-kube-descheduler-operator',
    operatorPackageName: DESCHEDULER_OPERATOR_PACKAGE,
    recommendedYAML: KUBE_DESCHEDULER_RECOMMENDED_YAML,
  },
  {
    crModel: MetalLBModel,
    crName: 'metallb',
    crNamespace: 'metallb-system',
    enableAnnotation: 'platform.kubevirt.io/enable-metallb',
    operatorPackageName: METALLB_OPERATOR_NAME,
    recommendedYAML: METALLB_RECOMMENDED_YAML,
  },
  {
    crModel: ForkliftControllerModel,
    crName: 'forklift-controller',
    crNamespace: 'openshift-mtv',
    enableAnnotation: 'platform.kubevirt.io/enable-mtv',
    operatorPackageName: MTV_OPERATOR_NAME,
    recommendedYAML: FORKLIFT_CONTROLLER_RECOMMENDED_YAML,
  },
  {
    crModel: UIPluginModel,
    crName: 'monitoring',
    operatorPackageName: CLUSTER_OBSERVABILITY_OPERATOR_PACKAGE,
    recommendedYAML: UI_PLUGIN_RECOMMENDED_YAML,
  },
  {
    crModel: LokiStackModel,
    crName: 'logging-loki',
    crNamespace: 'openshift-logging',
    enableAnnotation: 'platform.kubevirt.io/enable-logging',
    operatorPackageName: LOKI_OPERATOR_NAME,
    recommendedYAML: LOKI_STACK_RECOMMENDED_YAML,
  },
  {
    crModel: ClusterLogForwarderModel,
    crName: 'instance',
    crNamespace: 'openshift-logging',
    enableAnnotation: 'platform.kubevirt.io/enable-logging',
    operatorPackageName: CLUSTER_LOGGING_OPERATOR_NAME,
    recommendedYAML: CLUSTER_LOG_FORWARDER_RECOMMENDED_YAML,
  },
];
