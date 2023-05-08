import { RouteModel, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { TopologyDataResources } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';

import { K8sResourceConditionStatus, K8sResourceKind } from '../../../clusteroverview/utils/types';
import {
  EVENT_SOURCE_API_SERVER_KIND,
  EVENT_SOURCE_CAMEL_KIND,
  EVENT_SOURCE_CONTAINER_KIND,
  EVENT_SOURCE_KAFKA_KIND,
  EVENT_SOURCE_PING_KIND,
  EVENT_SOURCE_SINK_BINDING_KIND,
  KNATIVE_EVENT_SOURCE_APIGROUP,
} from '../knative/knative-const';
import {
  CamelKameletBindingModel,
  CamelKameletModel,
  DomainMappingModel,
  EventingBrokerModel,
  EventingTriggerModel,
  KafkaSinkModel,
  RevisionModel,
} from '../knative-models';
import { DeploymentKind } from '../types/commonTypes';
import {
  ConditionTypes,
  EventChannelKind,
  EventTriggerKind,
  RevisionKind,
  RouteKind,
  ServiceKind as knativeServiceKind,
} from '../types/knativeTypes';
import { PodKind } from '../types/podTypes';

type FirehoseResult<R extends K8sResourceCommon | K8sResourceCommon[] = K8sResourceKind[]> = {
  loaded: boolean;
  loadError: string;
  optional?: boolean;
  data: R;
  kind?: string;
};

export const sampleKnativeDeployments: FirehoseResult<DeploymentKind[]> = {
  loaded: true,
  loadError: '',
  data: [
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
        resourceVersion: '726179',
        name: 'default-ingress',
        uid: 'bccad3e4-8ce0-11e9-bb7b-0ebb55b110b8',
        creationTimestamp: '2019-04-22T11:35:43Z',
        generation: 2,
        namespace: 'testproject1',
        labels: {
          app: 'overlayimage-9jsl8',
          'serving.knative.dev/configuration': 'overlayimage',
          'serving.knative.dev/configurationGeneration': '1',
          'serving.knative.dev/revision': 'overlayimage-9jsl8',
          'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
          'serving.knative.dev/service': 'overlayimage',
        },
        ownerReferences: [
          {
            apiVersion: `${RevisionModel.apiGroup}/${RevisionModel.apiVersion}`,
            kind: RevisionModel.kind,
            name: 'overlayimage-fdqsf',
            uid: '02c34a0e-9638-11e9-b134-06a61d886b62',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 0,
        selector: {
          matchLabels: {
            'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'overlayimage-9jsl8',
              'serving.knative.dev/configuration': 'overlayimage',
              'serving.knative.dev/configurationGeneration': '1',
              'serving.knative.dev/revision': 'overlayimage-9jsl8',
              'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
              'serving.knative.dev/service': 'overlayimage',
            },
            annotations: {
              'sidecar.istio.io/inject': 'true',
              'traffic.sidecar.istio.io/includeOutboundIPRanges': '172.30.0.0/16',
            },
          },
          spec: {
            containers: [],
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {},
    },
    {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/revision': '1',
        },
        resourceVersion: '726179',
        name: 'default-ingress',
        uid: 'bccad3e4-8ce0-11e9-bb7b-0ebb55b110b8',
        namespace: 'testproject1',
        labels: {
          'eventing.knative.dev/broker': 'default',
        },
        ownerReferences: [
          {
            apiVersion: `${EventingBrokerModel.apiGroup}/${EventingBrokerModel.apiVersion}`,
            kind: EventingBrokerModel.kind,
            name: 'default',
            uid: '02c34a0e-9638-1110-b134-06a61d886b62',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        replicas: 0,
        selector: {
          matchLabels: {
            'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
          },
        },
        template: {
          metadata: {
            creationTimestamp: null,
            labels: {
              app: 'overlayimage-9jsl8',
              'serving.knative.dev/configuration': 'overlayimage',
              'serving.knative.dev/configurationGeneration': '1',
              'serving.knative.dev/revision': 'overlayimage-9jsl8',
              'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
              'serving.knative.dev/service': 'overlayimage',
            },
            annotations: {
              'sidecar.istio.io/inject': 'true',
              'traffic.sidecar.istio.io/includeOutboundIPRanges': '172.30.0.0/16',
            },
          },
          spec: {
            containers: [],
          },
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%',
          },
        },
        revisionHistoryLimit: 10,
        progressDeadlineSeconds: 600,
      },
      status: {},
    },
  ],
};

export const sampleKnativeReplicaSets: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      apiVersion: 'apps/v1',
      kind: 'ReplicaSet',
      metadata: {
        annotations: {
          'deployment.kubernetes.io/desired-replicas': '0',
          'deployment.kubernetes.io/max-replicas': '0',
          'deployment.kubernetes.io/revision': '1',
        },
        resourceVersion: '1389053',
        name: 'default-ingress-5d9685cc74',
        uid: 'bccd5351-8ce0-11e9-9020-0ab4b49bd478',
        creationTimestamp: '2019-06-12T07:07:27Z',
        generation: 1,
        namespace: 'testproject3',
        ownerReferences: [
          {
            apiVersion: 'apps/v1',
            kind: 'Deployment',
            name: '"default-ingress"',
            uid: 'bccad3e4-8ce0-11e9-bb7b-0ebb55b110b8',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
        labels: {
          app: 'overlayimage-9jsl8',
          'pod-template-hash': '5d9685cc74',
          'serving.knative.dev/configuration': 'overlayimage',
          'serving.knative.dev/configurationGeneration': '1',
          'serving.knative.dev/revision': 'overlayimage-9jsl8',
          'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
          'serving.knative.dev/service': 'overlayimage',
        },
      },
      spec: {
        template: {
          spec: {
            containers: [],
          },
        },
      },
      status: {
        replicas: 0,
        observedGeneration: 1,
      },
    },
  ],
};

export const sampleKnativePods: FirehoseResult<PodKind[]> = {
  loaded: true,
  loadError: '',
  data: [],
};

export const sampleKnativeReplicationControllers: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

export const sampleKnativeDeploymentConfigs: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

export const sampleRoutes: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

const sampleKnativeBuildConfigs: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

const sampleKnativeBuilds: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

let ConfigurationModel;
export const sampleKnativeConfigurations: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      apiVersion: `${ConfigurationModel.apiGroup}/${ConfigurationModel.apiVersion}`,
      kind: ConfigurationModel.kind,
      metadata: {
        name: 'overlayimage',
        namespace: 'testproject3',
        uid: '1317f615-9636-11e9-b134-06a61d886b62',
        resourceVersion: '1157349',
        labels: {
          'serving.knative.dev/route': 'overlayimage',
          'serving.knative.dev/service': 'overlayimage',
        },
        ownerReferences: [
          {
            kind: RouteModel.kind,
            apiVersion: `${RouteModel.apiGroup}/${RouteModel.apiVersion}`,
            name: 'overlayimage',
            uid: 'cea9496b-8ce0-11e9-bb7b-0ebb55b110b8',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {},
      status: {
        observedGeneration: 1,
        latestCreatedRevisionName: 'overlayimage-fdqsf',
        latestReadyRevisionName: 'overlayimage-fdqsf',
      },
    },
  ],
};

export const revisionObj: RevisionKind = {
  apiVersion: `${RevisionModel.apiGroup}/${RevisionModel.apiVersion}`,
  kind: RevisionModel.kind,
  metadata: {
    name: 'overlayimage-fdqsf',
    namespace: 'testproject3',
    uid: '02c34a0e-9638-11e9-b134-06a61d886b62',
    resourceVersion: '1157349',
    creationTimestamp: '2019-06-12T07:07:57Z',
    labels: {
      'serving.knative.dev/configuration': 'overlayimage',
      'serving.knative.dev/configurationGeneration': '2',
      'serving.knative.dev/service': 'overlayimage',
    },
    ownerReferences: [
      {
        apiVersion: `${ConfigurationModel.apiGroup}/${ConfigurationModel.apiVersion}`,
        kind: RouteModel.kind,
        name: 'overlayimage',
        uid: '1317f615-9636-11e9-b134-06a61d886b62',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
  },
  spec: {},
  status: {
    observedGeneration: 1,
    serviceName: 'overlayimage-fdqsf',
    conditions: [
      {
        lastTransitionTime: '2019-12-27T05:07:47Z',
        message: 'The target is not receiving traffic.',
        reason: 'NoTraffic',
        status: K8sResourceConditionStatus.False,
        type: ConditionTypes.Active,
      },
      {
        lastTransitionTime: '2019-12-27T05:06:47Z',
        status: K8sResourceConditionStatus.True,
        type: ConditionTypes.ContainerHealthy,
        message: '',
        reason: '',
      },
      {
        lastTransitionTime: '2019-12-27T05:06:47Z',
        status: K8sResourceConditionStatus.True,
        type: ConditionTypes.Ready,
        message: '',
        reason: '',
      },
      {
        lastTransitionTime: '2019-12-27T05:06:16Z',
        status: K8sResourceConditionStatus.True,
        type: ConditionTypes.ResourcesAvailable,
        message: '',
        reason: '',
      },
    ],
  },
};
export const sampleKnativeRevisions: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [revisionObj],
};

export const knativeRouteObj: RouteKind = {
  apiVersion: `${RouteModel.apiGroup}/${RouteModel.apiVersion}`,
  kind: RouteModel.kind,
  metadata: {
    name: 'overlayimage',
    namespace: 'testproject3',
    uid: '1317f615-9636-11e9-b134-06a61d886b62',
    resourceVersion: '1157349',
    creationTimestamp: '2019-06-12T07:07:57Z',
    labels: {
      'serving.knative.dev/route': 'overlayimage',
      'serving.knative.dev/service': 'overlayimage',
    },
    ownerReferences: [
      {
        apiVersion: `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`,
        kind: RouteModel.kind,
        name: 'overlayimage',
        uid: 'cea9496b-8ce0-11e9-bb7b-0ebb55b110b8',
        controller: true,
        blockOwnerDeletion: true,
      },
    ],
  },
  spec: {},
  status: {
    observedGeneration: 1,
    traffic: [{ latestRevision: true, percent: 100, revisionName: 'overlayimage-fdqsf' }],
    url: 'http://overlayimage.knativeapps.apps.bpetersen-june-23.devcluster.openshift.com',
    conditions: [
      { lastTransitionTime: '2019-12-27T05:06:47Z', status: 'True', type: 'AllTrafficAssigned' },
      { lastTransitionTime: '2019-12-27T05:07:29Z', status: 'True', type: 'IngressReady' },
      { lastTransitionTime: '2019-12-27T05:07:29Z', status: 'True', type: 'Ready' },
    ],
  },
};

export const sampleKnativeRoutes: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [knativeRouteObj],
};

export const knativeServiceObj: knativeServiceKind = {
  apiVersion: `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`,
  kind: ServiceModel.kind,
  metadata: {
    labels: {
      'app.kubernetes.io/part-of': 'myapp',
    },
    name: 'overlayimage',
    namespace: 'testproject3',
    uid: 'cea9496b-8ce0-11e9-bb7b-0ebb55b110b8',
    resourceVersion: '1157349',
    generation: 1,
  },
  spec: {
    template: {
      metadata: {
        labels: {
          'app.kubernetes.io/part-of': 'myapp',
        },
      },
    },
  },
  status: {
    observedGeneration: 1,
    url: 'http://overlayimage.knativeapps.apps.bpetersen-june-23.devcluster.openshift.com',
    latestCreatedRevisionName: 'overlayimage-fdqsf',
    latestReadyRevisionName: 'overlayimage-fdqsf',
    traffic: [
      {
        latestRevision: true,
        percent: 100,
        revisionName: 'overlayimage-fdqsf',
      },
    ],
    conditions: [
      { lastTransitionTime: '2019-12-27T05:06:47Z', status: 'True', type: 'ConfigurationsReady' },
      { lastTransitionTime: '2019-12-27T05:07:29Z', status: 'True', type: 'Ready' },
      { lastTransitionTime: '2019-12-27T05:07:29Z', status: 'True', type: 'RoutesReady' },
    ],
  },
};

export const sampleKnativeServices: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [knativeServiceObj],
};

export const getEventSourceResponse = (
  apiGroup: string,
  apiVersion: string,
  kind: string,
): FirehoseResult => {
  return {
    loaded: true,
    loadError: '',
    data: [
      {
        apiVersion: `${apiGroup}/${apiVersion}`,
        kind,
        metadata: {
          name: 'overlayimage',
          namespace: 'testproject3',
          uid: '1317f615-9636-11e9-b134-06a61d886b689_1',
          creationTimestamp: '2019-06-12T07:07:57Z',
        },
        spec: {
          sink: {
            apiVersion: 'serving.knative.dev/v1',
            kind: 'Service',
            name: 'overlayimage',
          },
        },
        status: {
          sinkUri: 'http://overlayimage.testproject3.svc.cluster.local',
        },
      },
    ],
  };
};

export const sampleEventSourceSinkbinding: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      apiVersion: `${KNATIVE_EVENT_SOURCE_APIGROUP}/v1`,
      kind: EVENT_SOURCE_SINK_BINDING_KIND,
      metadata: {
        name: 'bind-wss',
        namespace: 'testproject3',
        uid: '1317f615-9636-11e9-b134-06a61d886b689_1',
        creationTimestamp: '2019-06-12T07:07:57Z',
      },
      spec: {
        sink: {
          ref: {
            apiVersion: `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`,
            kind: ServiceModel.kind,
            name: 'wss-event-display',
          },
        },
        subject: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          namespace: 'testproject3',
          selector: {
            matchLabels: {
              app: 'wss',
            },
          },
        },
      },
    },
  ],
};

export const sampleSourceKameletBinding: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      kind: CamelKameletBindingModel.kind,
      apiVersion: `${CamelKameletBindingModel.apiGroup}/${CamelKameletBindingModel.apiVersion}`,
      metadata: {
        annotations: {
          'camel.apache.org/kamelet.icon':
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIuNjY3IiB4Mj0iLjQxNyIgeTE9Ii4xNjciIHkyPSIuNzUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzM3YWVlMiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzFlOTZjOCIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iLjY2IiB4Mj0iLjg1MSIgeTE9Ii40MzciIHkyPSIuODAyIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlZmY3ZmMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMjAiIHI9IjEyMCIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGZpbGw9IiNjOGRhZWEiIGQ9Ik05OCAxNzVjLTMuODg4IDAtMy4yMjctMS40NjgtNC41NjgtNS4xN0w4MiAxMzIuMjA3IDE3MCA4MCIvPjxwYXRoIGZpbGw9IiNhOWM5ZGQiIGQ9Ik05OCAxNzVjMyAwIDQuMzI1LTEuMzcyIDYtM2wxNi0xNS41NTgtMTkuOTU4LTEyLjAzNSIvPjxwYXRoIGZpbGw9InVybCgjYikiIGQ9Ik0xMDAuMDQgMTQ0LjQxbDQ4LjM2IDM1LjcyOWM1LjUxOSAzLjA0NSA5LjUwMSAxLjQ2OCAxMC44NzYtNS4xMjNsMTkuNjg1LTkyLjc2M2MyLjAxNS04LjA4LTMuMDgtMTEuNzQ2LTguMzYtOS4zNDlsLTExNS41OSA0NC41NzFjLTcuODkgMy4xNjUtNy44NDMgNy41NjctMS40MzggOS41MjhsMjkuNjYzIDkuMjU5IDY4LjY3My00My4zMjVjMy4yNDItMS45NjYgNi4yMTgtLjkxIDMuNzc2IDEuMjU4Ii8+PC9zdmc+',
        },
        resourceVersion: '267611',
        name: 'overlayimage-kb',
        uid: '3343caf6-f23f-420a-888e-e2c06aaaa843',
        creationTimestamp: '2020-11-17T07:06:51Z',
        generation: 3,
        namespace: 'testproject3',
      },
      spec: {
        sink: {
          ref: { apiVersion: 'serving.knative.dev/v1', kind: 'Service', name: 'event-display' },
        },
        source: {
          properties: { authorizationToken: 'token' },
          ref: {
            apiVersion: 'camel.apache.org/v1alpha1',
            kind: 'Kamelet',
            name: 'telegram-source',
          },
        },
      },
      status: {
        conditions: [
          {
            lastTransitionTime: '2020-11-17T08:19:41Z',
            lastUpdateTime: '2020-11-17T08:19:41Z',
            status: 'True',
            type: 'Ready',
          },
        ],
        phase: 'Ready',
      },
    },
  ],
};

export const sampleSourceKafkaSink: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      kind: KafkaSinkModel.kind,
      apiVersion: `${KafkaSinkModel.apiGroup}/${KafkaSinkModel.apiVersion}`,
      metadata: {
        annotations: {
          'camel.apache.org/kamelet.icon':
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgMjQwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIuNjY3IiB4Mj0iLjQxNyIgeTE9Ii4xNjciIHkyPSIuNzUiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzM3YWVlMiIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzFlOTZjOCIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJiIiB4MT0iLjY2IiB4Mj0iLjg1MSIgeTE9Ii40MzciIHkyPSIuODAyIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNlZmY3ZmMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMjAiIHI9IjEyMCIgZmlsbD0idXJsKCNhKSIvPjxwYXRoIGZpbGw9IiNjOGRhZWEiIGQ9Ik05OCAxNzVjLTMuODg4IDAtMy4yMjctMS40NjgtNC41NjgtNS4xN0w4MiAxMzIuMjA3IDE3MCA4MCIvPjxwYXRoIGZpbGw9IiNhOWM5ZGQiIGQ9Ik05OCAxNzVjMyAwIDQuMzI1LTEuMzcyIDYtM2wxNi0xNS41NTgtMTkuOTU4LTEyLjAzNSIvPjxwYXRoIGZpbGw9InVybCgjYikiIGQ9Ik0xMDAuMDQgMTQ0LjQxbDQ4LjM2IDM1LjcyOWM1LjUxOSAzLjA0NSA5LjUwMSAxLjQ2OCAxMC44NzYtNS4xMjNsMTkuNjg1LTkyLjc2M2MyLjAxNS04LjA4LTMuMDgtMTEuNzQ2LTguMzYtOS4zNDlsLTExNS41OSA0NC41NzFjLTcuODkgMy4xNjUtNy44NDMgNy41NjctMS40MzggOS41MjhsMjkuNjYzIDkuMjU5IDY4LjY3My00My4zMjVjMy4yNDItMS45NjYgNi4yMTgtLjkxIDMuNzc2IDEuMjU4Ii8+PC9zdmc+',
        },
        resourceVersion: '267611',
        name: 'kafkasink-dummy',
        uid: '3343caf6-dg43-420a-888e-e2c06aaaa843',
        creationTimestamp: '2020-11-17T07:06:51Z',
        generation: 3,
        namespace: 'testproject3',
      },
      spec: {
        topic: 'kafka-demo',
        bootstrapServers: 'localhost:9092',
      },
      status: {
        conditions: [
          {
            lastTransitionTime: '2020-11-17T08:19:41Z',
            lastUpdateTime: '2020-11-17T08:19:41Z',
            status: 'True',
            type: 'Ready',
          },
        ],
        phase: 'Ready',
      },
    },
  ],
};

export const sampleDomainMapping: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      apiVersion: 'serving.knative.dev/v1alpha1',
      kind: 'DomainMapping',
      metadata: {
        name: 'example.org',
        namespace: 'my-app',
      },
      spec: {
        ref: {
          name: 'overlayimage',
          kind: ServiceModel.kind,
          apiVersion: `${ServiceModel.apiGroup}/${ServiceModel.apiVersion}`,
        },
      },
    },
  ],
};

export const sampleServices: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [
    {
      kind: 'Service',
      metadata: {
        name: 'overlayimage',
        namespace: 'testproject3',
        uid: 'cea9496b-8ce0-11e9-bb7b-0ebb55b110b8',
        resourceVersion: '1157349',
        creationTimestamp: '2019-06-12T07:07:57Z',
        labels: {
          'serving.knative.dev/route': 'overlayimage',
        },
        ownerReferences: [
          {
            apiVersion: `${RouteModel.apiGroup}/${RouteModel.apiVersion}`,
            kind: RouteModel.kind,
            name: 'overlayimage',
            uid: 'bca0d598-8ce0-11e9-bb7b-0ebb55b110b8',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
      },
      spec: {
        externalName: 'istio-ingressgateway.istio-system.svc.cluster.local',
        sessionAffinity: 'None',
        type: 'ExternalName',
      },
      status: {
        loadBalancer: {},
      },
    },
    {
      kind: 'Service',
      metadata: {
        name: 'overlayimage-9jsl8',
        namespace: 'testproject3',
        uid: 'bd1b788b-8ce0-11e9-bb7b-0ebb55b110b8',
        resourceVersion: '1160881',
        creationTimestamp: '2019-04-26T10:35:29Z',
        labels: {
          app: 'overlayimage-9jsl8',
          'networking.internal.knative.dev/serverlessservice': 'overlayimage-9jsl8',
          'networking.internal.knative.dev/serviceType': 'Public',
          'serving.knative.dev/configuration': 'overlayimage',
          'serving.knative.dev/configurationGeneration': '1',
          'serving.knative.dev/revision': 'overlayimage-9jsl8',
          'serving.knative.dev/revisionUID': 'bca0fb96-8ce0-11e9-bb7b-0ebb55b110b8',
          'serving.knative.dev/service': 'overlayimage',
        },
        ownerReferences: [
          {
            apiVersion: `networking.internal.knative.dev/v1`,
            kind: 'ServerlessService',
            name: 'overlayimage-9jsl8',
            uid: 'bcf5bfcf-8ce0-11e9-9020-0ab4b49bd478',
            controller: true,
            blockOwnerDeletion: true,
          },
        ],
        annotations: {
          'autoscaling.knative.dev/class': 'kpa.autoscaling.knative.dev',
        },
      },
      spec: {
        sessionAffinity: 'None',
        type: 'ClusterIP',
        clusterIP: '172.30.252.203',
      },
      status: {
        loadBalancer: {},
      },
    },
  ],
};

export const sampleClusterServiceVersions: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

export const EventBrokerObj: EventChannelKind = {
  apiVersion: `${EventingBrokerModel.apiGroup}/${EventingBrokerModel.apiVersion}`,
  kind: EventingBrokerModel.kind,
  metadata: {
    name: 'default',
    namespace: 'testproject3',
    uid: 'a35e6244-3233-473d-9120-ed274c7ae811',
  },
  spec: {
    subscriber: [
      {
        subscriberUri: 'http://channel-display0.testproject3.svc.cluster.local',
        uid: 'ae670cb1-cb66-4444-aead-c366552e7cef',
      },
    ],
  },
  status: {
    address: {
      url: 'http://channel-display1.testproject3.svc.cluster.local',
    },
  },
};

export const EventTriggerObj: EventTriggerKind = {
  apiVersion: `${EventingTriggerModel.apiGroup}/${EventingTriggerModel.apiVersion}`,
  kind: EventingTriggerModel.kind,
  metadata: {
    name: 'my-service-trigger',
    namespace: 'default',
  },
  spec: {
    broker: 'default',
    filter: {
      attributes: {
        type: 'dev.knative.sources.ping',
      },
    },
    subscriber: {
      ref: {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        name: knativeServiceObj.metadata.name,
      },
    },
  },
};

const sampleBrokers: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [EventBrokerObj],
};

const sampleTriggers: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [EventTriggerObj],
};

const sampleKamelets: FirehoseResult = {
  loaded: true,
  loadError: '',
  data: [],
};

export const MockKnativeResources: TopologyDataResources = {
  deployments: sampleKnativeDeployments,
  deploymentConfigs: sampleKnativeDeploymentConfigs,
  replicationControllers: sampleKnativeReplicationControllers,
  replicaSets: sampleKnativeReplicaSets,
  pods: sampleKnativePods,
  services: sampleServices,
  routes: sampleRoutes,
  buildConfigs: sampleKnativeBuildConfigs,
  builds: sampleKnativeBuilds,
  ksservices: sampleKnativeServices,
  ksroutes: sampleKnativeRoutes,
  configurations: sampleKnativeConfigurations,
  revisions: sampleKnativeRevisions,
  [EVENT_SOURCE_CONTAINER_KIND]: getEventSourceResponse(
    KNATIVE_EVENT_SOURCE_APIGROUP,
    'v1',
    EVENT_SOURCE_CONTAINER_KIND,
  ),
  [EVENT_SOURCE_CAMEL_KIND]: getEventSourceResponse(
    KNATIVE_EVENT_SOURCE_APIGROUP,
    'v1alpha1',
    EVENT_SOURCE_CAMEL_KIND,
  ),
  [EVENT_SOURCE_KAFKA_KIND]: getEventSourceResponse(
    KNATIVE_EVENT_SOURCE_APIGROUP,
    'v1beta1',
    EVENT_SOURCE_KAFKA_KIND,
  ),
  [EVENT_SOURCE_SINK_BINDING_KIND]: sampleEventSourceSinkbinding,
  [EVENT_SOURCE_PING_KIND]: getEventSourceResponse(
    KNATIVE_EVENT_SOURCE_APIGROUP,
    'v1',
    EVENT_SOURCE_PING_KIND,
  ),
  [EVENT_SOURCE_API_SERVER_KIND]: getEventSourceResponse(
    KNATIVE_EVENT_SOURCE_APIGROUP,
    'v1',
    EVENT_SOURCE_API_SERVER_KIND,
  ),
  clusterServiceVersions: sampleClusterServiceVersions,
  triggers: sampleTriggers,
  brokers: sampleBrokers,
  [CamelKameletBindingModel.plural]: sampleSourceKameletBinding,
  [KafkaSinkModel.plural]: sampleSourceKafkaSink,
  [DomainMappingModel.plural]: sampleDomainMapping,
  [CamelKameletModel.plural]: sampleKamelets,
};
