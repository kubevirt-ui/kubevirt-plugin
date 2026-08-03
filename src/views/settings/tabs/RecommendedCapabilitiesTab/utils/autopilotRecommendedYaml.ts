/**
 * Static recommended YAML for autopilot-managed operator CRs.
 * Used for read-only display in the ReviewRecommendationModal.
 */

export const KUBE_DESCHEDULER_RECOMMENDED_YAML = `apiVersion: operator.openshift.io/v1
kind: KubeDescheduler
metadata:
  name: cluster
  namespace: openshift-kube-descheduler-operator
spec:
  mode: Predictive
  deschedulingIntervalSeconds: 3600
  profiles:
    - KubeVirtRelieveAndMigrate
  managementState: Managed`;

export const METALLB_RECOMMENDED_YAML = `apiVersion: metallb.io/v1beta1
kind: MetalLB
metadata:
  name: metallb
  namespace: metallb-system`;

export const FORKLIFT_CONTROLLER_RECOMMENDED_YAML = `apiVersion: forklift.konveyor.io/v1beta1
kind: ForkliftController
metadata:
  name: forklift-controller
  namespace: openshift-mtv
spec:
  feature_must_gather_api: true
  feature_volume_populator: true`;

export const UI_PLUGIN_RECOMMENDED_YAML = `apiVersion: observability.openshift.io/v1alpha1
kind: UIPlugin
metadata:
  name: monitoring
spec:
  type: Monitoring`;

export const LOKI_STACK_RECOMMENDED_YAML = `apiVersion: loki.grafana.com/v1
kind: LokiStack
metadata:
  name: logging-loki
  namespace: openshift-logging
spec:
  size: 1x.extra-small
  storage:
    schemas:
      - effectiveDate: "2024-10-01"
        version: v13
  tenants:
    mode: openshift-logging`;

export const CLUSTER_LOG_FORWARDER_RECOMMENDED_YAML = `apiVersion: observability.openshift.io/v1
kind: ClusterLogForwarder
metadata:
  name: instance
  namespace: openshift-logging
spec:
  managementState: Managed
  outputs:
    - lokiStack:
        target:
          name: logging-loki
          namespace: openshift-logging
      name: default-lokistack
      type: LokiStack
  pipelines:
    - inputRefs:
        - infrastructure
        - application
        - audit
      name: default-logstore
      outputRefs:
        - default-lokistack`;
