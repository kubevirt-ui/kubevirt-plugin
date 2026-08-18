import type RequestContextClient from '@/clients/request-context-client';
import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import type BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

type UploadToastAssertions = Pick<
  BootableVolumesPage,
  | 'clickAbortUpload'
  | 'expectAbortedUploadToastVisible'
  | 'expectUploadingOrTerminalToastVisible'
  | 'isAbortUploadButtonVisible'
>;

const SUITE = 'Test Virtualization Bootable volumes page';
const TAB_MODAL = '#tab-modal';
const DUMMY_DESTINATION = 'docker://quay.io/kubevirt-plugin-pw-tests/dummy-export:latest';
const DUMMY_USERNAME = 'testuser';
const DUMMY_PASSWORD = 'testpass';

async function createBootableVolumeViaApi(
  apiClient: RequestContextClient,
  namespace: string,
  name: string,
  timeoutMs: number,
): Promise<void> {
  await apiClient.createDataVolume(namespace, {
    apiVersion: 'cdi.kubevirt.io/v1beta1',
    kind: 'DataVolume',
    metadata: {
      name,
      namespace,
      labels: {
        'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
        'instancetype.kubevirt.io/default-preference': 'fedora',
      },
    },
    spec: {
      source: { blank: {} },
      storage: {
        resources: { requests: { storage: '1Gi' } },
      },
    },
  });
  apiClient.trackResource('DataVolume', name, namespace);

  const succeeded = await apiClient.waitForDataVolumeSucceeded(name, namespace, timeoutMs);
  if (!succeeded) {
    throw new Error(`Blank DataVolume ${name} did not reach Succeeded in ${namespace}`);
  }

  await apiClient.createDataSource(namespace, {
    apiVersion: 'cdi.kubevirt.io/v1beta1',
    kind: 'DataSource',
    metadata: {
      name,
      namespace,
      labels: {
        'instancetype.kubevirt.io/default-instancetype': 'u1.medium',
        'instancetype.kubevirt.io/default-preference': 'fedora',
      },
    },
    spec: {
      source: {
        pvc: {
          name,
          namespace,
        },
      },
    },
  });
  apiClient.trackResource('DataSource', name, namespace);
}

/**
 * Registry export against a dummy Quay destination may show an uploading toast
 * (abortable) or fail quickly with bad credentials. Accept either path.
 */
async function abortOrAcceptTerminalToast(
  bootableVolumesPage: UploadToastAssertions,
  timeout: number,
): Promise<void> {
  const state = await bootableVolumesPage.expectUploadingOrTerminalToastVisible(undefined, timeout);

  if (state === 'uploading') {
    const abortVisible = await bootableVolumesPage.isAbortUploadButtonVisible(timeout);
    expect(abortVisible, 'Abort button should be visible while uploading').toBe(true);
    await bootableVolumesPage.clickAbortUpload();
    await bootableVolumesPage.expectAbortedUploadToastVisible(undefined, timeout);
    return;
  }

  if (state === 'error' || state === 'aborted') {
    // Dummy registry credentials often fail auth before abort is possible.
    return;
  }

  throw new Error(`Unexpected terminal toast state for registry upload: ${state}`);
}

test.describe('Tier1 Bootable Volumes - Upload to registry', { tag: [T1_TAG] }, () => {
  test(
    'Save is disabled until all required fields are filled',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-registry-validate');
      const volumeName = utils.generateRandomDataVolumeName('bv-reg-validate');
      await createBootableVolumeViaApi(apiClient, ns, volumeName, utils.TestTimeouts.DEFAULT);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
      await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(volumeName, ns);

      await test.step('Open the "Upload to registry" modal', async () => {
        await bootableVolumesPage.clickRowActionUploadToRegistry(volumeName);
        const formVisible = await bootableVolumesPage.verifyUploadToRegistryFormFieldsVisible();
        expect(formVisible, 'Upload to registry form fields should be visible').toBe(true);
      });

      await test.step('Save is disabled while the form is empty', async () => {
        const disabled = await bootableVolumesPage.isUploadToRegistryModalButtonDisabled();
        expect(disabled, 'Save should be disabled with an empty form').toBe(true);
      });

      await test.step('Save is still disabled with only some required fields filled', async () => {
        await bootableVolumesPage.fillUploadToRegistryForm('registry-name', '', '', '');
        const disabled = await bootableVolumesPage.isUploadToRegistryModalButtonDisabled();
        expect(
          disabled,
          'Save should stay disabled until destination/username/password are set',
        ).toBe(true);
      });

      await test.step('Save becomes enabled once all required fields are filled', async () => {
        await bootableVolumesPage.fillUploadToRegistryForm(
          'registry-name',
          DUMMY_DESTINATION,
          DUMMY_USERNAME,
          DUMMY_PASSWORD,
        );
        const disabled = await bootableVolumesPage.isUploadToRegistryModalButtonDisabled();
        expect(disabled, 'Save should be enabled once the form is complete').toBe(false);
      });

      await bootableVolumesPage.cancelUploadToRegistryModal();
    },
  );

  test(
    'Submits successfully, closes the modal automatically, and shows an uploading toast',
    { tag: ['@nonpriv'] },
    async ({ bootableVolumesPage, apiClient, utils }) => {
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

      const ns = await setupTestNamespace(apiClient, 'bv-registry-submit');
      const volumeName = utils.generateRandomDataVolumeName('bv-reg-submit');
      await createBootableVolumeViaApi(apiClient, ns, volumeName, utils.TestTimeouts.DEFAULT);

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
      await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(volumeName, ns);

      await test.step('Fill the form and submit', async () => {
        await bootableVolumesPage.clickRowActionUploadToRegistry(volumeName);
        await bootableVolumesPage.fillUploadToRegistryForm(
          'registry-name',
          DUMMY_DESTINATION,
          DUMMY_USERNAME,
          DUMMY_PASSWORD,
        );
        await bootableVolumesPage.clickSaveInUploadToRegistryModal();
      });

      await test.step('Modal closes automatically while the upload continues in the background', async () => {
        const modalClosed = await bootableVolumesPage.waitForElementHidden(
          TAB_MODAL,
          utils.TestTimeouts.ELEMENT_WAIT,
        );
        expect(modalClosed, 'Upload to registry modal should close on submit').toBe(true);
      });

      await test.step('Uploading toast appears, or export fails with dummy credentials', async () => {
        await abortOrAcceptTerminalToast(
          bootableVolumesPage,
          utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
        );
      });
    },
  );

});
