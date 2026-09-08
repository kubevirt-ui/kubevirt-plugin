import { type TFunction } from 'i18next';

import {
  type IoK8sApiBatchV1Job,
  type IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { buildCSVContent } from '@kubevirt-utils/hooks/useTableExport/exportToCSV';

import { getCheckupsSelfValidationColumns } from './checkupsSelfValidationListDefinition';

jest.mock('./checkupsSelfValidationCells', () => ({
  ActionsCell: () => null,
  ClusterCell: () => null,
  NameCell: () => null,
  NamespaceCell: () => null,
  StatusCell: () => null,
  TimeCell: () => null,
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
});
