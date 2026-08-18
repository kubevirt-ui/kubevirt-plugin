import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Test Virtualization Bootable volumes page';
const TAB_MODAL = '#tab-modal';
const UPLOAD_IMAGE_FILENAME = 'bv-upload-cirros.img';

test.describe('Tier1 Bootable Volumes - Upload experience', { tag: [T1_TAG] }, () => {
  test(
    'Uploads a bootable volume from a local file and completes successfully',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-upload-ok');
      const volumeName = utils.generateRandomDataVolumeName('bv-upload');
      const imagePath = await utils.TestFileFactory.downloadCirrosImage(UPLOAD_IMAGE_FILENAME);
      apiClient.trackResource('DataVolume', volumeName, ns);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      await test.step('Open the "Add volume" form and upload a local image', async () => {
        await bootableVolumesPage.clickCreateAndSelectOption('With form');
        await bootableVolumesPage.fillCreateBootableVolumeFormAndSave(volumeName, imagePath);
      });

      await test.step('Uploading toast appears', async () => {
        await bootableVolumesPage.expectUploadingToastVisible(
          UPLOAD_IMAGE_FILENAME,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });

      await test.step('Upload completes and the DataVolume succeeds', async () => {
        const succeeded = await apiClient.waitForDataVolumeSucceeded(
          volumeName,
          ns,
          utils.TestTimeouts.FILE_UPLOAD,
        );
        expect(succeeded, 'DataVolume should reach the Succeeded phase').toBe(true);
      });

      await test.step('Success toast with a link to the new volume is shown', async () => {
        await bootableVolumesPage.expectSuccessUploadToastWithLink(
          `View bootable volume ${volumeName}`,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });

      await test.step('Volume row appears in the list', async () => {
        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
          volumeName,
          ns,
          utils.TestTimeouts.DEFAULT,
        );
        expect(rowVisible, 'Uploaded bootable volume row should be visible in the list').toBe(
          true,
        );
      });
    },
  );

  test(
    'Closing the Add volume modal keeps the upload running in the background',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-upload-bg');
      const volumeName = utils.generateRandomDataVolumeName('bv-upload-bg');
      const imagePath = await utils.TestFileFactory.downloadCirrosImage(UPLOAD_IMAGE_FILENAME);
      apiClient.trackResource('DataVolume', volumeName, ns);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      await test.step('Submit the upload form (modal closes immediately on submit)', async () => {
        await bootableVolumesPage.clickCreateAndSelectOption('With form');
        await bootableVolumesPage.fillCreateBootableVolumeFormAndSave(volumeName, imagePath);
      });

      await test.step('Modal is closed while the upload continues in the background', async () => {
        const modalClosed = await bootableVolumesPage.waitForElementHidden(
          TAB_MODAL,
          utils.TestTimeouts.ELEMENT_WAIT,
        );
        expect(modalClosed, 'Add volume modal should close on submit').toBe(true);

        await bootableVolumesPage.expectUploadingToastVisible(
          UPLOAD_IMAGE_FILENAME,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });

      await test.step('Abort the upload to clean up', async () => {
        await bootableVolumesPage.clickAbortUpload(UPLOAD_IMAGE_FILENAME);
        await bootableVolumesPage.expectAbortedUploadToastVisible(
          UPLOAD_IMAGE_FILENAME,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );

        const dvGone = await apiClient.waitForDataVolumeGone(
          volumeName,
          ns,
          utils.TestTimeouts.ELEMENT_WAIT,
        );
        expect(dvGone, 'DataVolume should be deleted after abort').toBe(true);
      });
    },
  );

  test(
    'Aborting an in-progress upload from the toast cancels it',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-upload-abort');
      const volumeName = utils.generateRandomDataVolumeName('bv-upload-abort');
      const imagePath = await utils.TestFileFactory.downloadCirrosImage(UPLOAD_IMAGE_FILENAME);
      apiClient.trackResource('DataVolume', volumeName, ns);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);

      await test.step('Start the upload', async () => {
        await bootableVolumesPage.clickCreateAndSelectOption('With form');
        await bootableVolumesPage.fillCreateBootableVolumeFormAndSave(volumeName, imagePath);
        await bootableVolumesPage.expectUploadingToastVisible(
          UPLOAD_IMAGE_FILENAME,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });

      await test.step('Click "Cancel upload" in the toast', async () => {
        const abortButtonVisible = await bootableVolumesPage.isAbortUploadButtonVisible(
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          UPLOAD_IMAGE_FILENAME,
        );
        expect(abortButtonVisible, 'Abort button should be visible while uploading').toBe(true);
        await bootableVolumesPage.clickAbortUpload(UPLOAD_IMAGE_FILENAME);
      });

      await test.step('Aborted toast is shown and the upload stops', async () => {
        await bootableVolumesPage.expectAbortedUploadToastVisible(
          UPLOAD_IMAGE_FILENAME,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );

        const stillAbortable = await bootableVolumesPage.isAbortUploadButtonVisible(
          utils.TestTimeouts.UI_DELAY_MEDIUM,
          UPLOAD_IMAGE_FILENAME,
        );
        expect(stillAbortable, 'Abort button should no longer be visible once aborted').toBe(
          false,
        );

        const dvGone = await apiClient.waitForDataVolumeGone(
          volumeName,
          ns,
          utils.TestTimeouts.ELEMENT_WAIT,
        );
        expect(dvGone, 'DataVolume should be deleted after abort').toBe(true);
      });
    },
  );
});
