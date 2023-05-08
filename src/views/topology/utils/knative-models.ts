import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';
import { chart_color_cyan_400 as knativeServingColor } from '@patternfly/react-tokens/dist/js/chart_color_cyan_400';
import { chart_color_red_300 as knativeEventingColor } from '@patternfly/react-tokens/dist/js/chart_color_red_300';

import {
  CAMEL_APIGROUP,
  KNATIVE_EVENT_MESSAGE_APIGROUP,
  KNATIVE_EVENTING_APIGROUP,
  KNATIVE_SERVING_APIGROUP,
  STRIMZI_KAFKA_APIGROUP,
} from './knative/knative-const';

const apiVersion = 'v1';

export const ConfigurationModel: K8sKind = {
  apiGroup: KNATIVE_SERVING_APIGROUP,
  apiVersion,
  kind: 'Configuration',
  plural: 'configurations',
  label: 'Configuration',
  // t('kubevirt-plugin~Configuration')
  labelKey: 'kubevirt-plugin~Configuration',
  labelPlural: 'Configurations',
  // t('kubevirt-plugin~Configurations')
  labelPluralKey: 'kubevirt-plugin~Configurations',
  id: 'configuration',
  abbr: 'CFG',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const KnativeServingModel: K8sKind = {
  apiGroup: 'operator.knative.dev',
  apiVersion: 'v1alpha1',
  kind: 'KnativeServing',
  label: 'KnativeServing',
  // t('kubevirt-plugin~KnativeServing')
  labelKey: 'kubevirt-plugin~KnativeServing',
  labelPlural: 'KnativeServings',
  // t('kubevirt-plugin~KnativeServings')
  labelPluralKey: 'kubevirt-plugin~KnativeServings',
  plural: 'knativeservings',
  id: 'knativeserving',
  abbr: 'KS',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const RevisionModel: K8sKind = {
  apiGroup: KNATIVE_SERVING_APIGROUP,
  apiVersion,
  kind: 'Revision',
  label: 'Revision',
  // t('kubevirt-plugin~Revision')
  labelKey: 'kubevirt-plugin~Revision',
  // t('kubevirt-plugin~Revisions')
  labelPluralKey: 'kubevirt-plugin~Revisions',
  labelPlural: 'Revisions',
  plural: 'revisions',
  id: 'revision',
  abbr: 'REV',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const RouteModel: K8sKind = {
  apiGroup: KNATIVE_SERVING_APIGROUP,
  apiVersion,
  kind: 'Route',
  label: 'Route',
  // t('kubevirt-plugin~Route')
  labelKey: 'kubevirt-plugin~Route',
  labelPlural: 'Routes',
  // t('kubevirt-plugin~Routes')
  labelPluralKey: 'kubevirt-plugin~Routes',
  plural: 'routes',
  id: 'route',
  abbr: 'RT',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const ServiceModel: K8sKind = {
  apiGroup: KNATIVE_SERVING_APIGROUP,
  apiVersion,
  kind: 'Service',
  label: 'Service',
  // t('kubevirt-plugin~Service')
  labelKey: 'kubevirt-plugin~Service',
  // t('kubevirt-plugin~Services')
  labelPluralKey: 'kubevirt-plugin~Services',
  labelPlural: 'Services',
  plural: 'services',
  id: 'service',
  abbr: 'KSVC',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const DomainMappingModel: K8sKind = {
  apiGroup: KNATIVE_SERVING_APIGROUP,
  apiVersion: 'v1alpha1',
  kind: 'DomainMapping',
  label: 'DomainMapping',
  // t('kubevirt-plugin~DomainMapping')
  labelKey: 'kubevirt-plugin~DomainMapping',
  labelPlural: 'DomainMappings',
  // t('kubevirt-plugin~DomainMappings')
  labelPluralKey: 'kubevirt-plugin~DomainMappings',
  plural: 'domainmappings',
  id: 'DomainMapping',
  abbr: 'DM',
  namespaced: true,
  crd: true,
  color: knativeServingColor.value,
};

export const EventingSubscriptionModel: K8sKind = {
  apiGroup: KNATIVE_EVENT_MESSAGE_APIGROUP,
  apiVersion,
  kind: 'Subscription',
  label: 'Subscription',
  // t('kubevirt-plugin~Subscription')
  labelKey: 'kubevirt-plugin~Subscription',
  labelPlural: 'Subscriptions',
  // t('kubevirt-plugin~Subscriptions')
  labelPluralKey: 'kubevirt-plugin~Subscriptions',
  plural: 'subscriptions',
  id: 'subscriptioneventing',
  abbr: 'S',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const EventingBrokerModel: K8sKind = {
  apiGroup: KNATIVE_EVENTING_APIGROUP,
  apiVersion,
  kind: 'Broker',
  label: 'Broker',
  // t('kubevirt-plugin~Broker')
  labelKey: 'kubevirt-plugin~Broker',
  labelPlural: 'Brokers',
  // t('kubevirt-plugin~Brokers')
  labelPluralKey: 'kubevirt-plugin~Brokers',
  plural: 'brokers',
  id: 'broker',
  abbr: 'B',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const EventingTriggerModel: K8sKind = {
  apiGroup: KNATIVE_EVENTING_APIGROUP,
  apiVersion,
  kind: 'Trigger',
  label: 'Trigger',
  // t('kubevirt-plugin~Trigger')
  labelKey: 'kubevirt-plugin~Trigger',
  labelPlural: 'Triggers',
  // t('kubevirt-plugin~Triggers')
  labelPluralKey: 'kubevirt-plugin~Triggers',
  plural: 'triggers',
  id: 'trigger',
  abbr: 'T',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const CamelIntegrationModel: K8sKind = {
  apiGroup: CAMEL_APIGROUP,
  apiVersion,
  kind: 'Integration',
  label: 'Integration',
  // t('kubevirt-plugin~Integration')
  labelKey: 'kubevirt-plugin~Integration',
  labelPlural: 'Integrations',
  // t('kubevirt-plugin~Integration')
  labelPluralKey: 'kubevirt-plugin~Integrations',
  plural: 'integrations',
  id: 'integration',
  abbr: 'I',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const KafkaModel: K8sKind = {
  apiGroup: STRIMZI_KAFKA_APIGROUP,
  apiVersion: 'v1beta2',
  kind: 'Kafka',
  label: 'Kafka',
  // t('kubevirt-plugin~Kafka')
  labelKey: 'kubevirt-plugin~Kafka',
  labelPlural: 'Kafkas',
  // t('kubevirt-plugin~Kafkas')
  labelPluralKey: 'kubevirt-plugin~Kafkas',
  plural: 'kafkas',
  id: 'kafka',
  abbr: 'K',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const KafkaTopicModel: K8sKind = {
  apiGroup: STRIMZI_KAFKA_APIGROUP,
  apiVersion: 'v1beta2',
  kind: 'KafkaTopic',
  label: 'KafkaTopic',
  // t('kubevirt-plugin~KafkaTopic')
  labelKey: 'kubevirt-plugin~KafkaTopic',
  labelPlural: 'KafkaTopics',
  // t('kubevirt-plugin~KafkaTopics')
  labelPluralKey: 'kubevirt-plugin~KafkaTopics',
  plural: 'kafkatopics',
  id: 'kafkatopic',
  abbr: 'KT',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const CamelKameletBindingModel: K8sKind = {
  apiGroup: CAMEL_APIGROUP,
  apiVersion: 'v1alpha1',
  kind: 'KameletBinding',
  label: 'KameletBinding',
  // t('kubevirt-plugin~KameletBinding')
  labelKey: 'kubevirt-plugin~KameletBinding',
  labelPlural: 'KameletBindings',
  // t('kubevirt-plugin~KameletBindings')
  labelPluralKey: 'kubevirt-plugin~KameletBindings',
  plural: 'kameletbindings',
  id: 'kameletbinding',
  abbr: 'KB',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const CamelKameletModel: K8sKind = {
  apiGroup: CAMEL_APIGROUP,
  apiVersion: 'v1alpha1',
  kind: 'Kamelet',
  label: 'Kamelet',
  // t('kubevirt-plugin~Kamelet')
  labelKey: 'kubevirt-plugin~Kamelet',
  labelPlural: 'Kamelets',
  // t('kubevirt-plugin~Kamelets')
  labelPluralKey: 'kubevirt-plugin~Kamelets',
  plural: 'kamelets',
  id: 'kamelet',
  abbr: 'K',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};

export const KafkaSinkModel: K8sKind = {
  apiGroup: 'eventing.knative.dev',
  apiVersion: 'v1alpha1',
  kind: 'KafkaSink',
  label: 'KafkaSink',
  // t('kubevirt-plugin~KafkaSink')
  labelKey: 'kubevirt-plugin~KafkaSink',
  labelPlural: 'KafkaSinks',
  // t('kubevirt-plugin~KafkaSinks')
  labelPluralKey: 'kubevirt-plugin~KafkaSinks',
  plural: 'kafkasinks',
  id: 'kafkasink',
  abbr: 'KS',
  namespaced: true,
  crd: true,
  color: knativeEventingColor.value,
};
