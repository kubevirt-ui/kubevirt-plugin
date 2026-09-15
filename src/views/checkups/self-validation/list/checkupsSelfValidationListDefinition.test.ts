import { type TFunction } from 'i18next';

import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { buildCSVContent } from '@kubevirt-utils/hooks/useTableExport/exportToCSV';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { STATUS_COMPLETION_TIME_STAMP } from '../../utils/utils';
import { formatStatusTimestamp } from '../utils/selfValidationResults';
import { getCheckupsSelfValidationColumns } from './checkupsSelfValidationListDefinition';

jest.mock('./checkupsSelfValidationCells', () => ({
  ActionsCell: () => null,
  ClusterCell: () => null,
  NameCell: () => null,
  NamespaceCell: () => null,
  StatusCell: () => null,
}));

const t = ((key: string) => key) as TFunction;

const configMap = {
  data: {},
  metadata: { name: 'ocp-virt-self-validation-amber-tarantula-14', namespace: 'gal' },
} as IoK8sApiCoreV1ConfigMap;

const succeededJob = {
  metadata: { name: 'ocp-virt-self-validation-amber-tarantula-14' },
  status: {
    completionTime: '2026-09-04T18:41:05Z',
    startTime: '2026-09-04T18:39:18Z',
    succeeded: 1,
  },
} as IoK8sApiBatchV1Job;

describe('self-validation checkup CSV export', () => {
  it('exports Succeeded from job status when configmap status.succeeded is unset', () => {
    const csv = buildCSVContent(
      [configMap],
      getCheckupsSelfValidationColumns(t, false, [succeededJob]),
      ['name', 'status'],
      {
        getJobByName: () => [succeededJob],
      },
    );

    expect(csv).toContain('ocp-virt-self-validation-amber-tarantula-14,Succeeded');
    expect(csv).not.toContain('Failed');
  });

  it('falls back to configmap completion timestamp when the job has none', () => {
    const jobWithoutCompletion = {
      metadata: { name: configMap.metadata?.name },
      status: { startTime: '2026-09-04T18:39:18Z', succeeded: 1 },
    } as IoK8sApiBatchV1Job;
    const completionTimestamp = '2026-09-04T18:41:05Z';
    const configMapWithCompletion = {
      ...configMap,
      data: { [STATUS_COMPLETION_TIME_STAMP]: completionTimestamp },
    };

    const csv = buildCSVContent(
      [configMapWithCompletion],
      getCheckupsSelfValidationColumns(t, false, [jobWithoutCompletion]),
      ['name', 'completionTime'],
      {
        getJobByName: () => [jobWithoutCompletion],
      },
    );

    expect(csv).toContain(configMap.metadata?.name);
    expect(csv).toContain(formatStatusTimestamp(completionTimestamp, t, NO_DATA_DASH));
  });

  it('exports a dash when job and configmap completion times are missing', () => {
    const csv = buildCSVContent(
      [configMap],
      getCheckupsSelfValidationColumns(t, false, [succeededJob]),
      ['name', 'completionTime'],
      {
        getJobByName: () => [
          {
            ...succeededJob,
            status: { startTime: succeededJob.status?.startTime, succeeded: 1 },
          },
        ],
      },
    );

    expect(csv).toContain(`${configMap.metadata?.name},${NO_DATA_DASH}`);
  });
});
