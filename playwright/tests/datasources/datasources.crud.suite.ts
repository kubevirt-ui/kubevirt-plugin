import { T1_TAG, T2_TAG } from '@/data-models/allure-constants';
import { ROUTE_DATASOURCES_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/datasources-fixture';
import { CRUD_NAMES, DATASOURCE_FORM } from '@/utils/constants';
import {
  generateNameWithBase,
  generateRandomAnnotationKey,
  generateRandomLabel,
} from '@/utils/random-data-generator';
import { MINUTE, TestTimeouts } from '@/utils/test-config';

test.describe(`DataSources UI update and delete ${ROUTE_DATASOURCES_TAG} ${T1_TAG}`, () => {
  test('ID(CNV-9375) Update DataSource labels in UI', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = CRUD_NAMES.dataSourceExample;
    const label = generateRandomLabel('random');

    await apiClient.deleteDataSource(name, testNamespace);
    await apiClient.applyDataSourceExample(testNamespace, name);

    try {
      await ds.openDetail(testNamespace, name);
      await expect(ds.resourceTitle()).toContainText(name);
      await ds.editLabels(name, label);
      await expect(ds.labelOnDetail(label)).toBeVisible();
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });

  test('ID(CNV-9379) Delete DataSource from list in UI', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = CRUD_NAMES.dataSourceExample;

    await apiClient.deleteDataSource(name, testNamespace);
    await apiClient.applyDataSourceExample(testNamespace, name);

    await ds.goToNamespaceList(testNamespace);
    await ds.filterByName(name);
    await expect(ds.row(name)).toBeVisible();
    await ds.openDeleteDialog(name);
    await expect(ds.deleteDialogHeading('DataSource')).toBeVisible();
    await ds.confirmDelete();
    await ds.goToNamespaceList(testNamespace);
    await ds.filterByName(name);
    await expect(ds.row(name)).toBeHidden();
  });
});

test.describe(`DataSources UI create and delete ${ROUTE_DATASOURCES_TAG} ${T2_TAG}`, () => {
  test('ID(CNV-9377) Create DataSource with form and delete in UI', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = generateNameWithBase(CRUD_NAMES.dataSourceForm, 50);

    await apiClient.deleteDataSource(name, testNamespace);

    await ds.goToNamespaceList(testNamespace);
    await ds.createFromForm(name, DATASOURCE_FORM.imageUrl, DATASOURCE_FORM.cron);
    await expect(ds.resourceTitle()).toContainText(name);
    await expect
      .poll(() => apiClient.dataSourceExists(name, testNamespace), {
        message: `DataSource ${testNamespace}/${name} should exist`,
        timeout: TestTimeouts.RESOURCE_CREATION,
      })
      .toBe(true);
    await ds.goToNamespaceList(testNamespace);
    await ds.filterByName(name);
    await expect(ds.nameLink(name)).toBeVisible({ timeout: TestTimeouts.LONG_OPERATION });
    await ds.openDeleteDialog(name);
    await expect(ds.deleteDialogHeading('DataSource')).toBeVisible();
    await ds.confirmDelete();
    await expect(ds.row(name)).toBeHidden({ timeout: 5 * MINUTE });
  });
});

test.describe(`DataSources UI annotations ${ROUTE_DATASOURCES_TAG} ${T2_TAG}`, () => {
  test.describe.configure({ mode: 'serial' });

  test('ID(CNV-9373) Add DataSource annotation in UI', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = CRUD_NAMES.dataSourceExample;
    const key = generateRandomAnnotationKey();

    await apiClient.deleteDataSource(name, testNamespace);
    await apiClient.applyDataSourceExample(testNamespace, name);

    try {
      await ds.openDetail(testNamespace, name);
      await ds.dismissConsoleObstructions();
      await ds.openAnnotationsModal();
      await ds.addAnnotation(key, 'val-e2e');
      await expect(ds.annotationsSummary()).toContainText(/1 Annotation/i);
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });

  test('ID(CNV-9374) Delete DataSource annotation in UI', async ({
    apiClient,
    dataSourcesPage: ds,
    testNamespace,
  }) => {
    const name = CRUD_NAMES.dataSourceExample;

    await apiClient.deleteDataSource(name, testNamespace);
    await apiClient.applyDataSourceWithAnnotations(testNamespace, name, {
      'other-key': 'other-val',
      'temp-key': 'temp-val',
    });

    try {
      await ds.openDetail(testNamespace, name);
      await ds.dismissConsoleObstructions();
      await expect(ds.annotationsSummary()).toContainText(/2 Annotation/i);
      await ds.openAnnotationsModal();
      await ds.deleteAnnotationByKey('temp-key');
      await expect(ds.annotationsSummary()).toContainText(/1 Annotation/i);
      await expect(ds.annotationsSummary()).not.toContainText(/temp-key/i);
    } finally {
      await apiClient.deleteDataSource(name, testNamespace);
    }
  });
});
