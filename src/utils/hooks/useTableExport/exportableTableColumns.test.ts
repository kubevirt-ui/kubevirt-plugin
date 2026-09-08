import { type TFunction } from 'i18next';

import {
  TemplateModel,
  type V1Template,
  VirtualMachineModel,
  VirtualMachineTemplateRequestModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1alpha1MigrationPolicy,
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type V1alpha1VirtualMachineTemplateRequest } from '@kubevirt-ui-ext/kubevirt-api/virt-template';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NON_EXPORTABLE_COLUMN_KEYS } from '@kubevirt-utils/hooks/useTableExport/constants';
import {
  buildCSVContent,
  getExportableColumns,
} from '@kubevirt-utils/hooks/useTableExport/exportToCSV';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
import {
  type ApplicationAwareQuota,
  CalculationMethod,
} from '@kubevirt-utils/resources/quotas/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { getMigrationPoliciesColumns } from '../../../views/migrationpolicies/list/migrationPoliciesDefinition';
import { MIGRATION_POLICY_COLUMN_KEYS } from '../../../views/migrationpolicies/utils/constants';
import { QuotaColumn, QuotaScope } from '../../../views/quotas/list/constants';
import { getQuotaColumns } from '../../../views/quotas/list/quotasDefinition';
import { RESOURCE_KEYS } from '../../../views/quotas/utils/constants';
import {
  getTemplateColumns,
  TEMPLATE_COLUMN_KEYS,
} from '../../../views/templates/list/virtualMachineTemplatesDefinition';
import {
  Metric,
  resetVMMetrics,
  setMetricFromResponse,
} from '../../../views/virtualmachines/list/metrics';
import {
  getVMColumns,
  VM_COLUMN_KEYS,
  type VMCallbacks,
} from '../../../views/virtualmachines/list/virtualMachinesDefinition';
import {
  getVMIColumns,
  VMI_COLUMN_KEYS,
} from '../../../views/virtualmachinesinstance/list/virtualMachinesInstancesDefinition';

jest.mock('../../../views/migrationpolicies/list/MigrationPoliciesCells', () => ({
  ActionsCell: () => null,
  AutoConvergeCell: () => null,
  BandwidthCell: () => null,
  ClusterCell: () => null,
  CompletionTimeoutCell: () => null,
  NameCell: () => null,
  PostCopyCell: () => null,
  ProjectLabelsCell: () => null,
  VMLabelsCell: () => null,
}));

jest.mock('../../../views/virtualmachinesinstance/list/cells/VMIActionsCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaActionsCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaAdditionalCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaCPUCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaCreatedCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaMemoryCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaNameCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaNamespaceCell', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../views/quotas/list/cells/QuotaVMICountCell', () => ({
  __esModule: true,
  default: () => null,
}));

const t = ((key: string, options?: Record<string, unknown>) => {
  if (!options) {
    return key;
  }

  return Object.entries(options).reduce((result, [name, value]) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return result;
    }
    return result.replaceAll(`{{${name}}}`, String(value));
  }, key);
}) as TFunction;

const getLabeledColumnsMissingGetValue = <TData, TCallbacks = undefined>(
  columns: ColumnConfig<TData, TCallbacks>[],
): string[] =>
  columns
    .filter((col) => col.label && !NON_EXPORTABLE_COLUMN_KEYS.has(col.key) && !col.getValue)
    .map((col) => col.key);

const setMetric = (name: string, namespace: string, metric: Metric, value: number): void => {
  const response: PrometheusResponse = {
    data: {
      result: [
        {
          metric: { name, namespace },
          value: [Date.now() / 1000, String(value)],
        },
      ],
      resultType: 'vector',
    },
    status: 'success',
  };

  setMetricFromResponse(response, metric);
};

beforeEach(() => {
  resetVMMetrics();
});

describe('exported table columns require getValue', () => {
  it('covers every labeled VM list column', () => {
    expect(getLabeledColumnsMissingGetValue(getVMColumns(t, '', true, true))).toEqual([]);
  });

  it('covers every labeled template list column', () => {
    expect(getLabeledColumnsMissingGetValue(getTemplateColumns(t, '', true))).toEqual([]);
  });

  it('covers every labeled migration policy column', () => {
    expect(getLabeledColumnsMissingGetValue(getMigrationPoliciesColumns(t, true))).toEqual([]);
  });

  it('covers every labeled VMI list column', () => {
    expect(getLabeledColumnsMissingGetValue(getVMIColumns(t, ''))).toEqual([]);
  });

  it('covers every labeled quota column', () => {
    expect(
      getLabeledColumnsMissingGetValue(
        getQuotaColumns(t, 'ns', QuotaScope.PROJECT, CalculationMethod.VirtualResources),
      ),
    ).toEqual([]);
  });
});

describe('VM list CSV export', () => {
  it('includes Memory, CPU, and Network when those columns are active', () => {
    const columns = getVMColumns(t, 'ns', false, false);
    const exportable = getExportableColumns(columns, [
      VM_COLUMN_KEYS.name,
      VM_COLUMN_KEYS.memoryUsage,
      VM_COLUMN_KEYS.cpuUsage,
      VM_COLUMN_KEYS.networkUsage,
    ]);

    expect(exportable.map((col) => col.key)).toEqual([
      VM_COLUMN_KEYS.name,
      VM_COLUMN_KEYS.memoryUsage,
      VM_COLUMN_KEYS.cpuUsage,
      VM_COLUMN_KEYS.networkUsage,
    ]);
  });

  it('emits formatted metric values and dashes for stopped VMs', () => {
    const namespace = 'csv-ns';
    const runningName = 'csv-running-vm';
    setMetric(runningName, namespace, Metric.CpuUsage, 1);
    setMetric(runningName, namespace, Metric.MemoryUsage, 2147483648);
    setMetric(runningName, namespace, Metric.NetworkUsage, 1048576);

    const runningVM = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: runningName, namespace },
      status: { printableStatus: 'Running' },
    } as V1VirtualMachine;

    const stoppedVM = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: 'csv-stopped-vm', namespace },
      status: { printableStatus: 'Stopped' },
    } as V1VirtualMachine;

    const vmi = {
      spec: {
        domain: {
          cpu: { cores: 2 },
          memory: { guest: '4Gi' },
        },
      },
    } as V1VirtualMachineInstance;

    const callbacks = {
      getVmi: (vm: V1VirtualMachine) => (vm.metadata?.name === runningName ? vmi : undefined),
      getVmim: () => undefined,
      pvcMapper: {},
      vmiMapper: { mapper: {}, nodeNames: {} },
      vmimMapper: {},
    } as VMCallbacks;

    const csv = buildCSVContent(
      [runningVM, stoppedVM],
      getVMColumns(t, namespace, false, false),
      [
        VM_COLUMN_KEYS.name,
        VM_COLUMN_KEYS.cpuUsage,
        VM_COLUMN_KEYS.memoryUsage,
        VM_COLUMN_KEYS.networkUsage,
      ],
      callbacks,
    );

    expect(csv).toContain('Name,Memory,CPU,Network');
    expect(csv).toContain(`${runningName},50.00%,50.00%,1 MiBps`);
    expect(csv).toContain(`csv-stopped-vm,${NO_DATA_DASH},${NO_DATA_DASH},${NO_DATA_DASH}`);
  });

  it('dashes CPU when the VM is running but the VMI is missing', () => {
    const namespace = 'csv-ns';
    const name = 'csv-running-no-vmi';
    setMetric(name, namespace, Metric.CpuUsage, 1);

    const vm = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name, namespace },
      status: { printableStatus: 'Running' },
    } as V1VirtualMachine;

    const csv = buildCSVContent(
      [vm],
      getVMColumns(t, namespace, false, false),
      [VM_COLUMN_KEYS.name, VM_COLUMN_KEYS.cpuUsage],
      {
        getVmi: () => undefined,
        getVmim: () => undefined,
        pvcMapper: {},
        vmiMapper: { mapper: {}, nodeNames: {} },
        vmimMapper: {},
      } as VMCallbacks,
    );

    expect(csv).toContain(`${name},${NO_DATA_DASH}`);
  });

  it('emits Type=Status for filtered VM conditions', () => {
    const vm = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: 'csv-conditions-vm', namespace: 'csv-ns' },
      status: {
        conditions: [
          { reason: 'AllDVsReady', status: 'True', type: 'DataVolumesReady' },
          { status: 'True', type: 'LiveMigratable' },
          { status: 'True', type: 'Ready' },
          { reason: 'DisksNotShared', status: 'False', type: 'LiveMigratable' },
        ],
        printableStatus: 'Running',
      },
    } as V1VirtualMachine;

    const csv = buildCSVContent([vm], getVMColumns(t, 'csv-ns', false, false), [
      VM_COLUMN_KEYS.name,
      VM_COLUMN_KEYS.conditions,
    ]);

    expect(csv).toBe(
      'Name,Conditions\ncsv-conditions-vm,"DataVolumesReady=True, LiveMigratable=True"',
    );
  });

  it('joins VM list IP addresses from callbacks.getVmi', () => {
    const runningVM = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: 'csv-ip-vm', namespace: 'csv-ns' },
      status: { printableStatus: 'Running' },
    } as V1VirtualMachine;

    const stoppedVM = {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachine',
      metadata: { name: 'csv-ip-stopped', namespace: 'csv-ns' },
      status: { printableStatus: 'Stopped' },
    } as V1VirtualMachine;

    const csv = buildCSVContent(
      [runningVM, stoppedVM],
      getVMColumns(t, 'csv-ns', false, false),
      [VM_COLUMN_KEYS.name, VM_COLUMN_KEYS.ipAddress],
      {
        getVmi: (vm: V1VirtualMachine) =>
          vm.metadata?.name === 'csv-ip-vm'
            ? ({
                status: {
                  interfaces: [
                    {
                      ipAddress: '10.0.0.1',
                      ipAddresses: ['10.0.0.1', '10.0.0.2'],
                      name: 'eth0',
                    },
                  ],
                },
              } as V1VirtualMachineInstance)
            : undefined,
        getVmim: () => undefined,
        pvcMapper: {},
        vmiMapper: { mapper: {}, nodeNames: {} },
        vmimMapper: {},
      } as VMCallbacks,
    );

    expect(csv).toContain('Name,IP address');
    expect(csv).toContain('csv-ip-vm,"10.0.0.1, 10.0.0.2"');
    expect(csv).toContain(`csv-ip-stopped,${NO_DATA_DASH}`);
  });
});

describe('template list CSV export', () => {
  it('includes CPU | Memory when that column is active', () => {
    const columns = getTemplateColumns(t, 'ns', false);
    const exportable = getExportableColumns(columns, [
      TEMPLATE_COLUMN_KEYS.name,
      TEMPLATE_COLUMN_KEYS.cpu,
    ]);

    expect(exportable.map((col) => col.key)).toEqual([
      TEMPLATE_COLUMN_KEYS.name,
      TEMPLATE_COLUMN_KEYS.cpu,
    ]);
  });

  it('emits CPU | Memory text and a dash for template requests', () => {
    const template = {
      kind: TemplateModel.kind,
      metadata: { name: 'fedora-template' },
      objects: [
        {
          kind: VirtualMachineModel.kind,
          spec: {
            template: {
              spec: {
                domain: {
                  cpu: { cores: 2 },
                  memory: { guest: '4Gi' },
                },
              },
            },
          },
        },
      ],
    } as V1Template;

    const request = {
      kind: VirtualMachineTemplateRequestModel.kind,
      metadata: { name: 'pending-request' },
    } as V1alpha1VirtualMachineTemplateRequest;

    const csv = buildCSVContent([template, request], getTemplateColumns(t, 'ns', false), [
      TEMPLATE_COLUMN_KEYS.name,
      TEMPLATE_COLUMN_KEYS.cpu,
    ]);

    expect(csv).toContain('Name,CPU | Memory');
    expect(csv).toContain('fedora-template,2 CPU | 4 GiB Memory');
    expect(csv).toContain(`pending-request,${NO_DATA_DASH}`);
  });
});

describe('migration policy CSV export', () => {
  it('includes project and VMI label columns when they are active', () => {
    const columns = getMigrationPoliciesColumns(t, false);
    const exportable = getExportableColumns(columns, [
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.PROJECT_LABELS,
      MIGRATION_POLICY_COLUMN_KEYS.VM_LABELS,
    ]);

    expect(exportable.map((col) => col.key)).toEqual([
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.PROJECT_LABELS,
      MIGRATION_POLICY_COLUMN_KEYS.VM_LABELS,
    ]);
  });

  it('serializes selector labels into CSV cells', () => {
    const policy = {
      metadata: { name: 'allow-prod' },
      spec: {
        selectors: {
          namespaceSelector: { env: 'prod' },
          virtualMachineInstanceSelector: { app: 'db' },
        },
      },
    } as V1alpha1MigrationPolicy;

    const csv = buildCSVContent([policy], getMigrationPoliciesColumns(t, false), [
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.PROJECT_LABELS,
      MIGRATION_POLICY_COLUMN_KEYS.VM_LABELS,
    ]);

    expect(csv).toContain('Name,Project labels,VirtualMachineInstance labels');
    expect(csv).toContain('allow-prod,env: prod,app: db');
  });

  it('serializes multiple selector labels into a quoted CSV cell', () => {
    const policy = {
      metadata: { name: 'allow-prod' },
      spec: {
        selectors: {
          namespaceSelector: { env: 'prod', team: 'cnv' },
        },
      },
    } as V1alpha1MigrationPolicy;

    const csv = buildCSVContent([policy], getMigrationPoliciesColumns(t, false), [
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.PROJECT_LABELS,
    ]);

    expect(csv).toContain('allow-prod,"env: prod, team: cnv"');
  });

  it('exports a dash for unset auto-converge instead of 0', () => {
    const policy = {
      metadata: { name: 'defaults' },
      spec: { selectors: {} },
    } as V1alpha1MigrationPolicy;

    const csv = buildCSVContent([policy], getMigrationPoliciesColumns(t, false), [
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.AUTO_CONVERGE,
    ]);

    expect(csv).toContain(`defaults,${NO_DATA_DASH}`);
  });

  it('exports humanized bandwidth instead of the raw quantity', () => {
    const policy = {
      metadata: { name: 'limited' },
      spec: { bandwidthPerMigration: '3Mi', selectors: {} },
    } as V1alpha1MigrationPolicy;

    const csv = buildCSVContent([policy], getMigrationPoliciesColumns(t, false), [
      MIGRATION_POLICY_COLUMN_KEYS.NAME,
      MIGRATION_POLICY_COLUMN_KEYS.BANDWIDTH,
    ]);

    expect(csv).toContain('limited,3 MiB');
    expect(csv).not.toContain('3Mi');
  });
});

describe('VMI list CSV values', () => {
  it('emits joined IP addresses', () => {
    const vmi = {
      metadata: { name: 'csv-vmi' },
      status: {
        interfaces: [
          { ipAddress: '10.0.0.1', ipAddresses: ['10.0.0.1', '10.0.0.2'], name: 'eth0' },
        ],
      },
    } as V1VirtualMachineInstance;

    const csv = buildCSVContent([vmi], getVMIColumns(t, 'ns'), [
      VMI_COLUMN_KEYS.name,
      VMI_COLUMN_KEYS.ipAddress,
    ]);

    expect(csv).toContain('Name,IP address');
    expect(csv).toContain('csv-vmi,"10.0.0.1, 10.0.0.2"');
  });

  it('emits VMI conditions that have a reason', () => {
    const vmi = {
      metadata: { name: 'csv-vmi-conditions' },
      status: {
        conditions: [
          { reason: 'GuestNotRunning', status: 'False', type: 'Ready' },
          { status: 'True', type: 'LiveMigratable' },
        ],
      },
    } as V1VirtualMachineInstance;

    const csv = buildCSVContent([vmi], getVMIColumns(t, 'ns'), [
      VMI_COLUMN_KEYS.name,
      VMI_COLUMN_KEYS.conditions,
    ]);

    expect(csv).toContain('csv-vmi-conditions,Ready=False');
    expect(csv).not.toContain('LiveMigratable=True');
  });
});

describe('quota list CSV values', () => {
  it('emits additional quota limits', () => {
    const quota = {
      kind: ApplicationAwareResourceQuotaModel.kind,
      metadata: { name: 'csv-quota' },
      status: {
        hard: { [RESOURCE_KEYS.pods]: '10' },
        used: { [RESOURCE_KEYS.pods]: '2' },
      },
    } as ApplicationAwareQuota;

    const csv = buildCSVContent(
      [quota],
      getQuotaColumns(t, 'ns', QuotaScope.PROJECT, CalculationMethod.VirtualResources),
      [QuotaColumn.NAME, QuotaColumn.ADDITIONAL],
    );

    expect(csv).toContain('Name,Additional quota');
    expect(csv).toContain('csv-quota,Pods: 2 / 10');
  });

  it('quotes multiple additional quota resources and dashes missing used values', () => {
    const quota = {
      kind: ApplicationAwareResourceQuotaModel.kind,
      metadata: { name: 'csv-quota-multi' },
      status: {
        hard: { [RESOURCE_KEYS.pods]: '10', [RESOURCE_KEYS.secrets]: '20' },
        used: { [RESOURCE_KEYS.pods]: '2' },
      },
    } as ApplicationAwareQuota;

    const csv = buildCSVContent(
      [quota],
      getQuotaColumns(t, 'ns', QuotaScope.PROJECT, CalculationMethod.VirtualResources),
      [QuotaColumn.NAME, QuotaColumn.ADDITIONAL],
    );

    expect(csv).toContain(`csv-quota-multi,"Pods: 2 / 10, Secrets: ${NO_DATA_DASH} / 20"`);
  });
});
