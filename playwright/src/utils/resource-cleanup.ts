import type RequestContextClient from '@/clients/request-context-client';
import { expect } from '@playwright/test';

export async function ensureDataSourceAbsent(
  apiClient: RequestContextClient,
  name: string,
  namespace: string,
): Promise<void> {
  await apiClient.deleteDataSource(name, namespace);
  await expect
    .poll(() => apiClient.dataSourceExists(name, namespace), {
      message: `pre-test cleanup: DataSource ${namespace}/${name} should be absent`,
    })
    .toBe(false);
}
