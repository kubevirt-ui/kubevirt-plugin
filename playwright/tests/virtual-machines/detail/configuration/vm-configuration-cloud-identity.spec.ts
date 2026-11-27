import { NONPRIV_TAG, T1_TAG, T1, VM_TABS_TAG } from '@/data-models/allure-constants';
import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-tabs-fixture';

const AWS_ROLE_ARN_ANNOTATION = 'eks.amazonaws.com/role-arn';

const getVMServiceAccountName = (vm: KubernetesResource | null): string | undefined =>
  (vm?.spec?.template as { spec?: { serviceAccountName?: string } } | undefined)?.spec
    ?.serviceAccountName;

test.describe(
  'VM Configuration — cloud identity',
  {
    tag: [ROUTE_VIRTUAL_MACHINES_DETAIL_CONFIGURATION_TAG, T1_TAG, NONPRIV_TAG],
  },
  () => {
    let namespace: string;
    let serviceAccountName: string;
    let vmName: string;

    test.beforeAll(async ({ apiClient, utils }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);

      namespace = utils.generateTestNamespace('vm-cloud-identity');
      serviceAccountName = utils.generateRandomVmName('aws-cloud-identity');
      vmName = utils.generateRandomVmName('vm-cloud-identity');

      await apiClient.createNamespace(namespace);
      await apiClient.waitForNamespaceReady(namespace);
      apiClient.trackResource('Namespace', namespace);

      await apiClient.createResourceByKind(
        'ServiceAccount',
        {
          apiVersion: 'v1',
          kind: 'ServiceAccount',
          metadata: {
            annotations: {
              [AWS_ROLE_ARN_ANNOTATION]:
                'arn:aws:iam::123456789012:role/kubevirt-cloud-identity-e2e',
            },
            name: serviceAccountName,
            namespace,
          },
        },
        namespace,
      );

      await apiClient.createVmFromTemplate(
        utils.TEMPLATE_METADATA_NAMES.RHEL9,
        vmName,
        namespace,
        'openshift',
        false,
      );
      apiClient.trackResource('VirtualMachine', vmName, namespace);

      const result = await apiClient.verifyVmCreated(
        vmName,
        namespace,
        utils.TestTimeouts.VM_BOOTUP,
      );
      if (!result.exists) throw new Error(`VM ${vmName} was not created`);
    });

    test.beforeEach(async ({ utils }) => {
      test.setTimeout(utils.TestTimeouts.TEST_EXTENDED);
      await utils.withAllure({
        suite: 'VM Configuration cloud identity',
        feature: T1,
        tags: [T1_TAG, VM_TABS_TAG, NONPRIV_TAG],
      });
    });

    test('Attach and detach a cloud identity', async ({
      apiClient,
      page,
      vmDetailPage,
      vmListPage,
    }) => {
      await vmListPage.navigateToVmViaTreeView(namespace, vmName);
      const branding = await page.evaluate(
        () => (window as unknown as { SERVER_FLAGS: { branding: string } }).SERVER_FLAGS.branding,
      );
      test.skip(branding !== 'rosa', 'Requires ROSA branding');

      await test.step('Attach an existing ServiceAccount', async () => {
        await vmDetailPage.openCloudIdentityModal();
        await vmDetailPage.selectExistingCloudIdentityServiceAccount(serviceAccountName);
        await vmDetailPage.saveCloudIdentity();

        await expect
          .poll(
            async () =>
              getVMServiceAccountName(await apiClient.getVirtualMachine(namespace, vmName)),
            { message: 'VM should use the selected ServiceAccount' },
          )
          .toBe(serviceAccountName);

        await expect
          .poll(() => vmDetailPage.getCloudIdentityDetailsText())
          .toContain(`AWS / ROSA: ${serviceAccountName}`);
      });

      await test.step('Detach the ServiceAccount without deleting it', async () => {
        await vmDetailPage.openCloudIdentityModal();
        await vmDetailPage.openCloudIdentityDetachModal();
        await vmDetailPage.confirmCloudIdentityDetach();

        await expect
          .poll(
            async () =>
              getVMServiceAccountName(await apiClient.getVirtualMachine(namespace, vmName)),
            { message: 'VM cloud identity should be detached' },
          )
          .toBeUndefined();

        const serviceAccount = await apiClient.getResourceByKind(
          'ServiceAccount',
          serviceAccountName,
          namespace,
        );
        expect(serviceAccount?.metadata?.name).toBe(serviceAccountName);

        await expect
          .poll(() => vmDetailPage.getCloudIdentityDetailsText())
          .toContain('Not configured');
      });
    });
  },
);
