/**
 * Cluster Test Preparation — runs once before gating tests.
 * Mirrors: cypress/tests/setup/setup.cy.ts
 */
import * as path from 'path';

import { test } from '../../fixtures';
import { env } from '../../utils/env';
import { oc, ocIgnore } from '../../utils/oc';

const TEST_NS = env.testNamespace;
const TEST_SECRET_NAME = env.testSecretName;
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
      onboardingPopoversHidden: {
        catalog: true,
        createProject: true,
        navCollapse: true,
        vmsTab: true,
      },
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

  test('configure cluster settings', async ({ loginPage, page, settingsPage }) => {
    await loginPage.login();
    await page.context().storageState({ path: 'playwright/.auth/session.json' });

    // SSH key configuration
    await settingsPage.navigateToSSHKeys(); // waits for 'Public SSH key' internally
    await settingsPage.expectSSHSectionVisible(SSH_SECTION);

    const sectionText = await settingsPage.sshSectionText(SSH_SECTION);
    const alreadyConfigured =
      sectionText.includes(TEST_NS) && sectionText.includes(TEST_SECRET_NAME);

    if (!alreadyConfigured) {
      await settingsPage.configureSSHSecret(TEST_NS, TEST_SECRET_NAME);
    }

    await settingsPage.expectSSHSecretConfigured(TEST_SECRET_NAME);

    // Preview features
    await settingsPage.enablePreviewFeature('vmTemplates');
  });
});
