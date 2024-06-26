import {
  ClusterRoleBindingModel,
  ClusterRoleModel,
  ConfigMapModel,
  JobModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1ServiceAccount,
  IoK8sApiRbacV1ClusterRole,
  IoK8sApiRbacV1ClusterRoleBinding,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  k8sCreate,
  k8sDelete,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  CONFIGMAP_NAME,
  generateWithNumbers,
  KUBEVIRT_VM_LATENCY_LABEL,
  STATUS_COMPILATION_TIME_STAMP,
  STATUS_FAILURE_REASON,
  STATUS_START_TIME_STAMP,
  STATUS_SUCCEEDED,
  STATUS_TIMEOUT,
} from '../../utils/utils';

export const KIAGNOSE_CONFIGMAP_ACCESS = 'kiagnose-configmap-access';
export const VM_LATENCY_CHECKUP_SA = 'vm-latency-checkup-sa';
export const KUBEVIRT_VM_LATENCY_CHECKER = 'kubevirt-vm-latency-checker';
export const KUBEVIRT_VM_LATENCY_LABEL_VALUE = 'kubevirt-vm-latency';
export const CONFIGMAP_NAMESPACE = 'CONFIGMAP_NAMESPACE';

export const STATUS_AVG_LATENCY_NANO = 'status.result.avgLatencyNanoSec';
export const STATUS_MAX_LATENCY_NANO = 'status.result.maxLatencyNanoSec';
export const STATUS_MEASUREMENT_DURATION = 'status.result.measurementDurationSec';
export const STATUS_MIN_LATENCY_NANO = 'status.result.minLatencyNanoSec';
export const STATUS_TARGET_NODE = 'status.result.targetNode';
export const STATUS_SOURCE_NODE = 'status.result.sourceNode';

export const STATUS_SAMPLE_DURATION = 'spec.param.sampleDurationSeconds';
export const STATUS_NAD_NAMESPACE = 'spec.param.networkAttachmentDefinitionNamespace';
export const STATUS_NAD_NAME = 'spec.param.networkAttachmentDefinitionName';
export const STATUS_MAX_DESIRED_LATENCY = 'spec.param.maxDesiredLatencyMilliseconds';

const serviceAccountResource = (namespace: string) => ({
  metadata: { name: VM_LATENCY_CHECKUP_SA, namespace },
});

const latencyCheckerClusterRole = {
  metadata: {
    name: KUBEVIRT_VM_LATENCY_CHECKER,
  },
  rules: [
    {
      apiGroups: ['kubevirt.io'],
      resources: ['virtualmachineinstances'],
      verbs: ['get', 'create', 'delete'],
    },
    {
      apiGroups: ['subresources.kubevirt.io'],
      resources: ['virtualmachineinstances/console'],
      verbs: ['get'],
    },
    {
      apiGroups: ['k8s.cni.cncf.io'],
      resources: ['network-attachment-definitions'],
      verbs: ['get'],
    },
  ],
};

const configMapClusterRole = {
  metadata: { name: KIAGNOSE_CONFIGMAP_ACCESS },
  rules: [
    {
      apiGroups: [''],
      resources: ['configmaps'],
      verbs: ['get', 'update'],
    },
  ],
};

const configMapClusterBinding = (namespace: string) => ({
  metadata: { name: KIAGNOSE_CONFIGMAP_ACCESS },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: KIAGNOSE_CONFIGMAP_ACCESS,
  },
  subjects: [{ kind: 'ServiceAccount', name: VM_LATENCY_CHECKUP_SA, namespace }],
});

const latencyCheckerClusterBinding = (namespace: string) => ({
  metadata: { name: KUBEVIRT_VM_LATENCY_CHECKER },
  roleRef: {
    apiGroup: 'rbac.authorization.k8s.io',
    kind: 'ClusterRole',
    name: KUBEVIRT_VM_LATENCY_CHECKER,
  },
  subjects: [
    {
      kind: 'ServiceAccount',
      name: VM_LATENCY_CHECKUP_SA,
      namespace,
    },
  ],
});

const installPromises = (namespace) => [
  k8sCreate<IoK8sApiCoreV1ServiceAccount>({
    data: serviceAccountResource(namespace),
    model: ServiceAccountModel,
  }),
  k8sCreate<IoK8sApiRbacV1ClusterRole>({
    data: latencyCheckerClusterRole,
    model: ClusterRoleModel,
  }),
  k8sCreate<IoK8sApiRbacV1ClusterRoleBinding>({
    data: latencyCheckerClusterBinding(namespace),
    model: ClusterRoleBindingModel,
  }),
  k8sCreate<IoK8sApiRbacV1ClusterRole>({
    data: configMapClusterRole,
    model: ClusterRoleModel,
  }),
  k8sCreate<IoK8sApiRbacV1ClusterRoleBinding>({
    data: configMapClusterBinding(namespace),
    model: ClusterRoleBindingModel,
  }),
];

const removePromises = (namespace: string) => [
  k8sDelete<IoK8sApiRbacV1ClusterRole>({
    model: ServiceAccountModel,
    resource: serviceAccountResource(namespace),
  }),
  k8sDelete<IoK8sApiRbacV1ClusterRole>({
    model: ClusterRoleModel,
    resource: latencyCheckerClusterRole,
  }),
  k8sDelete<IoK8sApiRbacV1ClusterRoleBinding>({
    model: ClusterRoleBindingModel,
    resource: latencyCheckerClusterBinding(namespace),
  }),
  k8sDelete<IoK8sApiRbacV1ClusterRole>({
    model: ClusterRoleModel,
    resource: configMapClusterRole,
  }),
  k8sDelete<IoK8sApiRbacV1ClusterRoleBinding>({
    model: ClusterRoleBindingModel,
    resource: configMapClusterBinding(namespace),
  }),
];

const runPromises = <T>(promises: Promise<T>[]): Promise<Awaited<T>[]> => {
  try {
    return Promise.all(promises);
  } catch (error) {
    kubevirtConsole.log(error);
    return error;
  }
};

export const installOrRemoveCheckupsNetworkPermissions = (
  namespace: string,
  remove?: boolean,
): Promise<Awaited<IoK8sApiRbacV1ClusterRole | IoK8sApiRbacV1ClusterRoleBinding>[]> => {
  return runPromises<IoK8sApiRbacV1ClusterRole | IoK8sApiRbacV1ClusterRoleBinding>(
    remove ? removePromises(namespace) : installPromises(namespace),
  );
};

export const findObjectByName = (arr: K8sResourceCommon[], name: string) =>
  (arr || []).find((obj) => obj?.metadata?.name === name);

type CreateNetworkCheckupType = (arg: {
  desiredLatency: string;
  name: string;
  namespace: string;
  nodeSource: string;
  nodeTarget: string;
  sampleDuration: string;
  selectedNAD: string;
}) => Promise<IoK8sApiCoreV1ConfigMap>;

const createJob = (name: string, namespace: string): Promise<IoK8sApiBatchV1Job> =>
  k8sCreate({
    data: {
      metadata: {
        labels: { [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE },
        name: generateWithNumbers(name),
        namespace,
      },
      spec: {
        backoffLimit: 0,
        template: {
          spec: {
            containers: [
              {
                capabilities: { drop: ['ALL'] },
                env: [
                  {
                    name: CONFIGMAP_NAMESPACE,
                    value: namespace,
                  },
                  {
                    name: CONFIGMAP_NAME,
                    value: name,
                  },
                  {
                    name: 'POD_UID',
                    valueFrom: { fieldRef: { fieldPath: 'metadata.uid' } },
                  },
                ],
                image:
                  'registry.redhat.io/container-native-virtualization/vm-network-latency-checkup-rhel9:v4.13.0',
                name: VM_LATENCY_CHECKUP_SA,
                runAsNonRoot: 'true',
                seccompProfile: { type: 'RuntimeDefault' },
                securityContext: { allowPrivilegeEscalation: false },
              },
            ],
            restartPolicy: 'Never',
            serviceAccountName: VM_LATENCY_CHECKUP_SA,
          },
        },
      },
    },
    model: JobModel,
  });

export const createNetworkCheckup: CreateNetworkCheckupType = async ({
  desiredLatency,
  name,
  namespace,
  nodeSource,
  nodeTarget,
  sampleDuration,
  selectedNAD,
}) => {
  await k8sCreate<IoK8sApiCoreV1ConfigMap>({
    data: {
      data: {
        [STATUS_MAX_DESIRED_LATENCY]: desiredLatency,
        [STATUS_NAD_NAME]: selectedNAD,
        [STATUS_NAD_NAMESPACE]: namespace,
        [STATUS_SAMPLE_DURATION]: sampleDuration,
        [STATUS_SOURCE_NODE]: nodeSource,
        [STATUS_TARGET_NODE]: nodeTarget,
        [STATUS_TIMEOUT]: '5m',
      },
      metadata: {
        labels: { [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE },
        name,
        namespace,
      },
    },
    model: ConfigMapModel,
  });
  return await createJob(name, namespace);
};

export const deleteNetworkCheckup = async (
  configMap: IoK8sApiCoreV1ConfigMap,
  jobs: IoK8sApiBatchV1Job[],
) => {
  try {
    await k8sDelete({
      model: ConfigMapModel,
      resource: configMap,
    });
    jobs.map((job) =>
      k8sDelete({
        model: JobModel,
        resource: job,
      }),
    );
  } catch (e) {
    kubevirtConsole.log(e?.message);
  }
};

export const rerunNetworkCheckup = async (
  resource: IoK8sApiCoreV1ConfigMap,
): Promise<IoK8sApiBatchV1Job> => {
  const isSucceeded = resource?.data?.[STATUS_SUCCEEDED] === 'true';
  await k8sPatch<IoK8sApiCoreV1ConfigMap>({
    data: [
      { op: 'remove', path: `/data/${STATUS_COMPILATION_TIME_STAMP}` },
      { op: 'remove', path: `/data/${STATUS_SUCCEEDED}` },
      { op: 'remove', path: `/data/${STATUS_FAILURE_REASON}` },
      { op: 'remove', path: `/data/${STATUS_START_TIME_STAMP}` },
      ...(isSucceeded
        ? [
            { op: 'remove', path: `/data/${STATUS_AVG_LATENCY_NANO}` },
            { op: 'remove', path: `/data/${STATUS_MAX_LATENCY_NANO}` },
            { op: 'remove', path: `/data/${STATUS_MEASUREMENT_DURATION}` },
            { op: 'remove', path: `/data/${STATUS_MIN_LATENCY_NANO}` },
          ]
        : []),
    ],
    model: ConfigMapModel,
    resource,
  });

  return createJob(resource.metadata.name, resource.metadata.namespace);
};
