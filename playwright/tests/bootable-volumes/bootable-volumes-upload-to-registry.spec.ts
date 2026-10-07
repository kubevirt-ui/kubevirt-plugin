import type RequestContextClient from '@/clients/request-context-client';
import { NONPRIV_TAG, T1, T1_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/bootable-volumes-fixture';
import type BootableVolumesPage from '@/page-objects/create-vm/bootable-volumes-page';
import { TestTimeouts } from '@/utils/test-config';
import { setupTestNamespace } from '@/utils/test-setup-helpers';
import { ROUTE_BOOTABLE_VOLUMES_TAG } from '@/data-models/route-tags';

type UploadToastAssertions = Pick<
  BootableVolumesPage,
  | 'clickAbortUpload'
  | 'expectAbortedUploadToastVisible'
  | 'expectUploadingOrTerminalToastVisible'
  | 'isAbortUploadButtonVisible'
>;

type UploaderPodSpec = {
  containers?: Array<{
    args?: string[];
    env?: Array<{ name?: string; valueFrom?: { secretKeyRef?: { name?: string } } }>;
  }>;
};

const SUITE = 'Test Virtualization Bootable volumes page';
const TAB_MODAL = '#tab-modal';
const DUMMY_DESTINATION = 'docker://quay.io/kubevirt-plugin-pw-tests/dummy-export:latest';
const DUMMY_USERNAME = 'testuser';
const DUMMY_PASSWORD = 'testpass';
const UPLOADER_POD_COMPONENT_LABEL = 'app.kubernetes.io/component';
const UPLOADER_POD_COMPONENT_VALUE = 'disk-uploader';

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
      // HPP CSI (hot-cluster default) uses WaitForFirstConsumer. Without this,
      // CDI leaves the DV in WaitForFirstConsumer until a consumer pod exists.
      annotations: {
        'cdi.kubevirt.io/storage.bind.immediate.requested': 'true',
      },
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

  const pvc = await apiClient.waitForPersistentVolumeClaim(name, namespace, timeoutMs);
  if (!pvc) {
    throw new Error(`PVC ${name} was not created in ${namespace}`);
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

/**
 * Polls for the `kubevirt-disk-uploader` Pod created by ExportModal's onSubmit
 * (createUploaderPod) in the given namespace. We verify the frontend creates the
 * right Pod with the right variables here — the backend/uploader image is
 * responsible for the actual registry push, which is out of scope for this suite.
 */
async function waitForUploaderPod(
  apiClient: RequestContextClient,
  namespace: string,
  timeoutMs: number,
): Promise<KubernetesResource> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const podList = await apiClient.getPods(namespace);
    const pod = podList.items.find(
      (item) =>
        item.metadata?.labels?.[UPLOADER_POD_COMPONENT_LABEL] === UPLOADER_POD_COMPONENT_VALUE,
    );
    if (pod) return pod;
    await new Promise((resolve) => setTimeout(resolve, TestTimeouts.POLLING_INTERVAL));
  }
  throw new Error(
    `kubevirt-disk-uploader Pod did not appear in ${namespace} within ${timeoutMs}ms`,
  );
}

test.describe(
  'Tier1 Bootable Volumes - Upload to registry',
  { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, T1_TAG] },
  () => {
    test(
      'Save is disabled until all required fields are filled',
      { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, '@nonpriv'] },
      async ({ bootableVolumesPage, apiClient, utils }) => {
        await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

        const ns = await setupTestNamespace(apiClient, 'bv-registry-validate');
        const volumeName = utils.generateRandomDataVolumeName('bv-reg-validate');
        await createBootableVolumeViaApi(
          apiClient,
          ns,
          volumeName,
          utils.TestTimeouts.RESOURCE_CREATION,
        );

        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        await bootableVolumesPage.filterByName(volumeName);
        const rowVisible = await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(
          volumeName,
          ns,
        );
        expect(rowVisible, `Bootable volume ${volumeName} should be visible`).toBe(true);

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
      { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, '@nonpriv'] },
      async ({ bootableVolumesPage, apiClient, utils }) => {
        await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

        const ns = await setupTestNamespace(apiClient, 'bv-registry-submit');
        const volumeName = utils.generateRandomDataVolumeName('bv-reg-submit');
        await createBootableVolumeViaApi(
          apiClient,
          ns,
          volumeName,
          utils.TestTimeouts.RESOURCE_CREATION,
        );

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

        await test.step('The uploader Pod is created with the right destination, volume, and secret (CNV-87382)', async () => {
          // Not tracked for explicit cleanup — the uploader Pod/Secret are namespaced
          // resources removed when the test namespace itself is torn down below.
          const pod = await waitForUploaderPod(apiClient, ns, utils.TestTimeouts.RESOURCE_CREATION);

          const container = (pod.spec as UploaderPodSpec)?.containers?.[0];
          expect(
            container?.args,
            'Uploader Pod args should include the chosen destination',
          ).toEqual(expect.arrayContaining(['--imagedestination', DUMMY_DESTINATION]));
          expect(
            container?.args,
            'Uploader Pod args should include the exported volume name',
          ).toEqual(expect.arrayContaining(['--volumename', volumeName]));
          expect(
            container?.args,
            'A PVC-only export (no VM) should use export-source-kind "pvc"',
          ).toEqual(expect.arrayContaining(['--export-source-kind', 'pvc']));

          const accessKeyEnv = container?.env?.find((e) => e.name === 'ACCESS_KEY_ID');
          const secretKeyEnv = container?.env?.find((e) => e.name === 'SECRET_KEY');
          const secretName = accessKeyEnv?.valueFrom?.secretKeyRef?.name;
          expect(secretName, 'ACCESS_KEY_ID should reference a Secret').toBeTruthy();
          expect(
            secretKeyEnv?.valueFrom?.secretKeyRef?.name,
            'SECRET_KEY should reference the same Secret as ACCESS_KEY_ID',
          ).toBe(secretName);

          const secret = await apiClient.getResourceByKind('secret', secretName ?? '', ns);
          apiClient.trackResource('Secret', secretName ?? '', ns);
          expect(
            secret,
            `Secret "${secretName}" referenced by the uploader Pod should exist`,
          ).toBeTruthy();
          expect((secret as KubernetesResource)?.type).toBe('Opaque');
          expect(
            Object.keys((secret as KubernetesResource)?.data ?? {}).sort(),
            'Secret should carry the registry username/password under accessKeyId/secretKey',
          ).toEqual(['accessKeyId', 'secretKey']);
        });

        await test.step('Uploading toast appears, or export fails with dummy credentials', async () => {
          await abortOrAcceptTerminalToast(
            bootableVolumesPage,
            utils.TestTimeouts.UI_ELEMENT_VISIBILITY,
          );
        });
      },
    );

    test(
      '"Upload to registry" action is enabled and opens the modal for a user with export permissions',
      { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, '@nonpriv'] },
      async ({ bootableVolumesPage, apiClient, utils }) => {
        await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG] });

        const ns = await setupTestNamespace(apiClient, 'bv-registry-permitted');
        const volumeName = utils.generateRandomDataVolumeName('bv-reg-permitted');
        await createBootableVolumeViaApi(
          apiClient,
          ns,
          volumeName,
          utils.TestTimeouts.RESOURCE_CREATION,
        );

        await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
        await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(volumeName, ns);

        await test.step('"Upload to registry" is enabled in the row kebab', async () => {
          const disabled = await bootableVolumesPage.isUploadToRegistryActionDisabled(volumeName);
          expect(
            disabled,
            '"Upload to registry" should be enabled for a user with export permissions',
          ).toBe(false);
        });

        await test.step('Clicking the enabled action opens the modal', async () => {
          await bootableVolumesPage.clickOpenUploadToRegistryAction();
          const formVisible = await bootableVolumesPage.verifyUploadToRegistryFormFieldsVisible();
          expect(
            formVisible,
            'Upload to registry modal should open when the action is enabled',
          ).toBe(true);
        });

        await bootableVolumesPage.cancelUploadToRegistryModal();
      },
    );
  },
);

test.describe(
  'Tier1 Bootable Volumes - Upload to registry is unavailable without permission',
  { tag: [ROUTE_BOOTABLE_VOLUMES_TAG, T1_TAG, NONPRIV_TAG] },
  () => {
    test('"Upload to registry" action is disabled with a permission tooltip for a non-privileged user', async ({
      bootableVolumesPage,
      apiClient,
      testConfig,
      utils,
    }) => {
      test.skip(!utils.EnvVariables.isNonPrivUser, 'Requires NON_PRIV=1');
      await utils.withAllure({ suite: SUITE, feature: T1, tags: [T1_TAG, NONPRIV_TAG] });

      const ns = testConfig.testNamespace;
      const volumeName = utils.generateRandomDataVolumeName('bv-reg-nonpriv');
      await createBootableVolumeViaApi(
        apiClient,
        ns,
        volumeName,
        utils.TestTimeouts.RESOURCE_CREATION,
      );

      await bootableVolumesPage.navigateToNamespaceBootableVolumesViaUI(ns);
      await bootableVolumesPage.ensureDataVolumeRowVisibleWithReNav(volumeName, ns);

      await test.step('"Upload to registry" is disabled in the row kebab', async () => {
        const disabled = await bootableVolumesPage.isUploadToRegistryActionDisabled(volumeName);
        expect(
          disabled,
          'Upload to registry should be disabled for a user lacking export permissions ' +
            '(create on Pod/Secret/ServiceAccount/Role/RoleBinding)',
        ).toBe(true);
      });

      await test.step('Hovering the disabled action shows a "no permission" tooltip', async () => {
        const tooltipText = await bootableVolumesPage.getUploadToRegistryActionTooltipText();
        expect(tooltipText).toContain("You don't have permission to perform this action");
      });
    });
  },
);
