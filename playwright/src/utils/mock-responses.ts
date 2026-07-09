/**
 * Mock response generators for Playwright route interception.
 * Provides functions to generate mock API responses for MigMigration, Prometheus alerts, etc.
 */

export const MOCK_ENDPOINTS = {
  MIG_MIGRATION:
    '**/api/kubernetes/apis/migration.openshift.io/v1alpha1/namespaces/openshift-migration/migmigrations/**',
  PROMETHEUS_RULES: '**/api/prometheus/api/v1/rules',
  NAMESPACE_SECRETS: (namespace = '**') =>
    `**/api/kubernetes/api/v1/namespaces/${namespace}/secrets*`,
} as const;

export const MockHelpers = {
  generateRandomId(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  },

  generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
};

export const MockResponses = {
  createMigMigrationResponse(vmName: string, namespace: string, diskNames?: string[]): object {
    const now = new Date();
    const startTime = new Date(now.getTime() - 4 * 60 * 1000); // 4 minutes ago
    const prepareEnd = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes ago
    const backupEnd = new Date(prepareEnd.getTime() + 1000); // 1 second after prepare
    const volumeEnd = new Date(now.getTime() - 1000); // 1 second ago
    const cleanupEnd = now; // now

    const planName = `migplan-${MockHelpers.generateRandomId()}`;
    const migrationName = `migmigration-${MockHelpers.generateRandomId()}`;
    const planUid = MockHelpers.generateUuid();
    const migrationUid = MockHelpers.generateUuid();
    const touchAnnotation = MockHelpers.generateUuid();

    // Generate progress entries for each disk
    const defaultDiskNames = diskNames || [
      `dv-${vmName}-disk-${MockHelpers.generateRandomId()}`,
      vmName,
    ];
    const progressEntries = defaultDiskNames.map(
      (diskName) =>
        `[${diskName}] ${namespace}/blockrsync-${MockHelpers.generateRandomId(
          5,
        )}: Completed 100% (${Math.floor(Math.random() * 30) + 10}s)`,
    );

    return {
      apiVersion: 'migration.openshift.io/v1alpha1',
      kind: 'MigMigration',
      metadata: {
        annotations: {
          'openshift.io/touch': touchAnnotation,
        },
        creationTimestamp: startTime.toISOString(),
        generation: 45,
        labels: {
          'migration.openshift.io/migplan-name': planName,
          'migration.openshift.io/migration-uid': migrationUid,
        },
        managedFields: [
          {
            apiVersion: 'migration.openshift.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:spec': {
                '.': {},
                'f:migPlanRef': {},
                'f:migrateState': {},
                'f:quiescePods': {},
                'f:stage': {},
              },
            },
            manager: 'Mozilla',
            operation: 'Update',
            time: startTime.toISOString(),
          },
          {
            apiVersion: 'migration.openshift.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:annotations': {
                  '.': {},
                  'f:openshift.io/touch': {},
                },
                'f:labels': {
                  '.': {},
                  'f:migration.openshift.io/migplan-name': {},
                  'f:migration.openshift.io/migration-uid': {},
                },
                'f:ownerReferences': {
                  '.': {},
                  [`k:{"uid":"${planUid}"}`]: {},
                },
              },
              'f:status': {
                '.': {},
                'f:conditions': {},
                'f:itinerary': {},
                'f:observedDigest': {},
                'f:phase': {},
                'f:pipeline': {},
                'f:startTimestamp': {},
              },
            },
            manager: 'manager',
            operation: 'Update',
            time: cleanupEnd.toISOString(),
          },
        ],
        name: migrationName,
        namespace: 'openshift-migration',
        ownerReferences: [
          {
            apiVersion: 'migration.openshift.io/v1alpha1',
            kind: 'MigPlan',
            name: planName,
            uid: planUid,
          },
        ],
        resourceVersion: String(Math.floor(Math.random() * 10000000)),
        uid: migrationUid,
      },
      spec: {
        migPlanRef: {
          name: planName,
          namespace: 'openshift-migration',
        },
        migrateState: true,
        quiescePods: true,
        stage: false,
      },
      status: {
        conditions: [
          {
            category: 'Advisory',
            durable: true,
            lastTransitionTime: cleanupEnd.toISOString(),
            message: 'The migration has completed successfully.',
            reason: 'Completed',
            status: 'True',
            type: 'Succeeded',
          },
        ],
        itinerary: 'Stage',
        observedDigest: MockHelpers.generateRandomId(64),
        phase: 'Completed',
        pipeline: [
          {
            completed: prepareEnd.toISOString(),
            message: 'Completed',
            name: 'Prepare',
            started: startTime.toISOString(),
          },
          {
            completed: backupEnd.toISOString(),
            message: 'Completed',
            name: 'StageBackup',
            started: prepareEnd.toISOString(),
          },
          {
            completed: volumeEnd.toISOString(),
            message: 'Completed',
            name: 'DirectVolume',
            progress: progressEntries,
            started: backupEnd.toISOString(),
          },
          {
            completed: cleanupEnd.toISOString(),
            message: 'Completed',
            name: 'Cleanup',
            started: volumeEnd.toISOString(),
          },
        ],
        startTimestamp: startTime.toISOString(),
      },
    };
  },

  createPrometheusAlertsResponse(
    vmName: string,
    namespace: string,
    alertName = 'VirtualMachineStuckInUnhealthyState',
  ): object {
    const activeAt = new Date().toISOString();
    return {
      status: 'success',
      data: {
        groups: [
          {
            name: 'alerts.rules',
            file: '/etc/prometheus/rules/prometheus-k8s-rulefiles-0/openshift-cnv-kubevirt-cnv-prometheus-rules.yaml',
            rules: [
              {
                state: 'firing',
                name: alertName,
                query:
                  'sum by (name, namespace, status) (kubevirt_vm_info{status_group="error"} == 1) unless on (name, namespace) kubevirt_vmi_info',
                duration: 600,
                labels: {
                  // kubernetes_operator_part_of is required by useVMAlerts to filter kubevirt rules
                  kubernetes_operator_component: 'kubevirt',
                  kubernetes_operator_part_of: 'kubevirt',
                  operator_health_impact: 'none',
                  severity: 'warning',
                },
                annotations: {
                  description: `Virtual machine ${vmName} in namespace ${namespace} has been in crashloopbackoff state for more than 10 minutes.`,
                  runbook_url:
                    'https://github.com/openshift/runbooks/blob/master/alerts/openshift-virtualization-operator/VirtualMachineStuckInUnhealthyState.md',
                  summary: 'Virtual machine in crashloopbackoff state for more than 10 minutes',
                },
                alerts: [
                  {
                    labels: {
                      alertname: alertName,
                      kubernetes_operator_component: 'kubevirt',
                      kubernetes_operator_part_of: 'kubevirt',
                      name: vmName,
                      namespace: namespace,
                      operator_health_impact: 'none',
                      severity: 'warning',
                      status: 'crashloopbackoff',
                    },
                    annotations: {
                      description: `Virtual machine ${vmName} in namespace ${namespace} has been in crashloopbackoff state for more than 10 minutes.`,
                      runbook_url:
                        'https://github.com/openshift/runbooks/blob/master/alerts/openshift-virtualization-operator/VirtualMachineStuckInUnhealthyState.md',
                      summary: 'Virtual machine in crashloopbackoff state for more than 10 minutes',
                    },
                    state: 'firing',
                    activeAt,
                    value: '1e+00',
                    partialResponseStrategy: 'WARN',
                  },
                ],
                health: 'ok',
                evaluationTime: 0.0001,
                lastEvaluation: activeAt,
                keepFiringFor: 0,
                type: 'alerting',
              },
            ],
            interval: 30,
            evaluationTime: 0.0001,
            lastEvaluation: activeAt,
            limit: 0,
            partialResponseStrategy: 'ABORT',
          },
        ],
      },
    };
  },
};
