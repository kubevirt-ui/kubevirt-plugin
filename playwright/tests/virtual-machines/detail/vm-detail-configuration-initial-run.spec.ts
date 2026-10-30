import { readFileSync } from 'node:fs';

import { T1_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import { CRUD_NAMES } from '@/utils/constants';
import { generateNameWithBase } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';
import { withExampleVm } from '@/utils/with-example-vm';

test.describe(`VM detail Configuration Initial run ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${T1_TAG}`, () => {
  test('Initial run tab shows Cloud-init and Sysprep sections', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
  }) => {
    await withExampleVm(
      apiClient,
      testNamespace,
      async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await vmDetail.goToInitialRunTab();
        await expect(vmDetail.initialRunHeading()).toBeVisible({
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await expect(vmDetail.initialRunCloudInitLabel()).toBeVisible();
        await expect(vmDetail.initialRunSysprepLabel()).toBeVisible();
        await expect(
          vmDetail.initialRunTabPanel().getByText('User', { exact: true }),
        ).toBeVisible();
      },
      generateNameWithBase(`${CRUD_NAMES.vmExample}-read`, 50),
    );
  });

  test('Cloud-init modal offers Form view and Script configure options', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
    vmDetailTabsPage: tabs,
  }) => {
    await withExampleVm(
      apiClient,
      testNamespace,
      async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await vmDetail.goToInitialRunTab();
        await tabs.openCloudInitModalFromInitialRun();
        await expect(tabs.cloudInitModal().getByText('Configure via:')).toBeVisible();
        await expect(tabs.cloudInitConfigureViaFormRadio()).toBeVisible();
        await expect(tabs.cloudInitConfigureViaScriptRadio()).toBeVisible();
        await tabs.closeCloudInitModal();
      },
      generateNameWithBase(`${CRUD_NAMES.vmExample}-modal`, 50),
    );
  });

  test('Initial run tab updates cloud-init user via form view', async ({
    apiClient,
    testNamespace,
    vmDetailPage: vmDetail,
    vmDetailTabsPage: tabs,
  }) => {
    const user = generateNameWithBase('pw-ci-user', 20);
    await withExampleVm(
      apiClient,
      testNamespace,
      async (name) => {
        await vmDetail.openVm(testNamespace, name);
        await vmDetail.goToInitialRunTab();
        await tabs.updateCloudInitUser(user);
        await expect
          .poll(() => vmDetail.cloudInitUserDataFromCluster(apiClient, testNamespace, name), {
            message: 'VM cloud-init userData should include the updated username',
            timeout: TestTimeouts.LONG_OPERATION,
          })
          .toContain(user);
      },
      generateNameWithBase(`${CRUD_NAMES.vmExample}-form`, 50),
    );
  });

  test.describe(() => {
    test.use({ acceptDownloads: true });

    test('Initial run cloud-init script view download and apply', async ({
      apiClient,
      page,
      testNamespace,
      vmDetailPage: vmDetail,
      vmDetailTabsPage: tabs,
    }) => {
      const user = generateNameWithBase('pw-script', 20);
      const yaml = `userData: |-
  #cloud-config
  user: ${user}
`;

      await withExampleVm(
        apiClient,
        testNamespace,
        async (name) => {
          await vmDetail.openVm(testNamespace, name);
          await vmDetail.goToInitialRunTab();
          await tabs.openCloudInitModalFromInitialRun();
          await tabs.selectCloudInitScriptView();
          await tabs.setCloudInitScriptEditorText(yaml);
          await tabs.saveCloudInitScriptInEditor();

          const editorText = await tabs.readCloudInitScriptEditorText();
          expect(editorText).toContain(user);

          const [download] = await Promise.all([
            page.waitForEvent('download'),
            tabs.cloudInitScriptEditorDownloadButton().click(),
          ]);
          const downloadPath = await download.path();
          expect(downloadPath).toBeTruthy();
          expect(readFileSync(downloadPath!, 'utf8')).toContain(user);

          await tabs.applyCloudInitModal();
          await expect
            .poll(() => vmDetail.cloudInitUserDataFromCluster(apiClient, testNamespace, name), {
              message: 'VM cloud-init userData should include the script username',
              timeout: TestTimeouts.LONG_OPERATION,
            })
            .toContain(user);
        },
        generateNameWithBase(`${CRUD_NAMES.vmExample}-script`, 50),
      );
    });
  });
});
