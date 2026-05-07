/**
 * Cluster Test Preparation — runs once before gating tests.
 * Mirrors: cypress/tests/setup/setup.cy.ts
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { expect, test } from '../../fixtures';
import { env } from '../../utils/env';
import { oc, ocIgnore } from '../../utils/oc';

const TEST_NS = env.testNamespace;
const TEST_SECRET_NAME = env.testSecretName;
const DEFAULT_VM_NAME = `${TEST_NS}-example`;
const RHEL_GUEST_IMAGE =
  process.env.RHEL_GUEST_IMAGE ?? 'registry.redhat.io/rhel10/rhel-guest-image';
const SSH_SECTION = 'settings-user-ssh-key';

// Absolute path to the rsa.pub fixture shipped with the test suite
const RSA_PUB = path.resolve(__dirname, '../../fixtures/rsa.pub');

// Tests run independently — VM creation must succeed even if SSH config fails
test.describe('Cluster Test Preparation', () => {
  test.beforeAll(() => {
    if (!TEST_NS || !TEST_SECRET_NAME) return;

    // Reset kubevirt-user-settings to standard default data so the SSH settings
    // page renders the project-selector UI cleanly (no stale SSH entries).
    const defaultUserSettings = JSON.stringify({
      guidedTour: false,
      onboardingPopoversHidden: { catalog: true, createProject: true, vmsTab: true },
      quickStart: { activeQuickStartID: '', dontShowWelcomeModal: true },
    });
    ocIgnore(
      `patch configmap kubevirt-user-settings -n openshift-cnv ` +
        `--type=merge -p '{"data":{"kube-admin":${JSON.stringify(defaultUserSettings)}}}'`,
    );

    // Create (or replace) the SSH public-key secret in the test namespace.
    ocIgnore(`delete secret ${TEST_SECRET_NAME} -n ${TEST_NS} --ignore-not-found`);
    oc(`create secret generic ${TEST_SECRET_NAME} -n ${TEST_NS} --from-file=key=${RSA_PUB}`);
  });

  test('login', async ({ loginPage }) => {
    await loginPage.login();
  });

  test('configure public ssh key', async ({ page, settingsPage }) => {
    await settingsPage.navigateToSSHKeys(); // waits for 'Public SSH key' internally
    await settingsPage.expectSSHSectionVisible(SSH_SECTION);

    const sectionText = await settingsPage.sshSectionText(SSH_SECTION);
    const alreadyConfigured =
      sectionText.includes(TEST_NS) && sectionText.includes(TEST_SECRET_NAME);

    if (!alreadyConfigured) {
      await settingsPage.configureSSHSecret(TEST_NS, TEST_SECRET_NAME);
    }

    await settingsPage.expectSSHSecretConfigured(TEST_SECRET_NAME);
  });

  test('create example VM', async () => {
    ocIgnore(`delete vm ${DEFAULT_VM_NAME} -n ${TEST_NS} --ignore-not-found`);

    // Write the manifest to a temp file — more reliable than a heredoc in execSync
    const manifest = `apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${DEFAULT_VM_NAME}
  labels:
    app: ${DEFAULT_VM_NAME}
spec:
  runStrategy: Halted
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${DEFAULT_VM_NAME}
    spec:
      domain:
        cpu:
          cores: 1
          sockets: 1
          threads: 1
        devices:
          disks:
            - disk:
                bus: virtio
              name: rootdisk
            - disk:
                bus: virtio
              name: cloudinitdisk
          interfaces:
            - masquerade: {}
              model: virtio
              name: default
          networkInterfaceMultiqueue: true
          rng: {}
        memory:
          guest: 2Gi
      hostname: ${DEFAULT_VM_NAME}
      networks:
        - name: default
          pod: {}
      terminationGracePeriodSeconds: 180
      volumes:
        - containerDisk:
            image: ${RHEL_GUEST_IMAGE}
          name: rootdisk
        - cloudInitNoCloud:
            userData: |
              #cloud-config
              user: rhel10
              password: test-password
              chpasswd: {expire: false}
          name: cloudinitdisk
`;
    const tmpFile = path.join(os.tmpdir(), `vm-${DEFAULT_VM_NAME}.yaml`);
    fs.writeFileSync(tmpFile, manifest);
    try {
      oc(`apply -n ${TEST_NS} -f ${tmpFile}`);
    } finally {
      fs.unlinkSync(tmpFile);
    }
  });
});
