import { NON_PRIV_TAG } from '@/data-models/allure-constants';
import { ROUTE_VIRTUAL_MACHINES_DETAIL_TAG } from '@/data-models/route-tags';
import { expect, test } from '@/fixtures/vm-detail-fixture';
import {
  generateEd25519SshPublicKey,
  generateNameWithBase,
  generateRandomVmName } from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

test.describe(`VM detail Configuration SSH ${ROUTE_VIRTUAL_MACHINES_DETAIL_TAG} ${NON_PRIV_TAG}`, () => {
  test('Public SSH key secret shows on Configuration SSH tab', async ({
    apiClient,
    testNamespace,
    vmDetailPage,
  }) => {
    const vmName = generateRandomVmName('ssh-vm').slice(0, 50);
    const secretName = generateNameWithBase('pw-ssh', 40);
    const publicSshKey = generateEd25519SshPublicKey();

    await apiClient.deleteVirtualMachine(vmName, testNamespace);

    try {
      await apiClient.applyYaml(`apiVersion: v1
kind: Secret
metadata:
  name: ${secretName}
  namespace: ${testNamespace}
type: Opaque
stringData:
  pub: ${publicSshKey}
`);
      // qemuGuestAgent propagation does not require a cloudInitNoCloud volume (noCloud does).
      await apiClient.applyYaml(`apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${vmName}
  namespace: ${testNamespace}
spec:
  runStrategy: Halted
  template:
    spec:
      accessCredentials:
      - sshPublicKey:
          propagationMethod:
            qemuGuestAgent:
              users:
              - cloud-user
          source:
            secret:
              secretName: ${secretName}
      domain:
        devices: {}
        resources:
          requests:
            memory: 1Gi
      volumes: []
`);

      await expect
        .poll(() => apiClient.virtualMachineExists(vmName, testNamespace), {
          message: `VirtualMachine ${testNamespace}/${vmName} should exist`,
          timeout: TestTimeouts.VM_CREATION,
        })
        .toBe(true);

      await vmDetailPage.openVm(testNamespace, vmName);
      await vmDetailPage.goToSshTab();
      await vmDetailPage.expandSshAuthorizedKeySectionIfNeeded();
      await expect(vmDetailPage.authorizedSshSecretName(secretName)).toBeVisible({
        timeout: TestTimeouts.LONG_OPERATION,
      });
    } finally {
      await apiClient.deleteVirtualMachine(vmName, testNamespace);
    }
  });
});
