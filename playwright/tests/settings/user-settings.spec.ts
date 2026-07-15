import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

const SUITE = 'Settings User';

test.describe('Settings User Tests', { tag: [CNV_SETTINGS_TAG] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.navigateToSettingsViaSidebar();
  });

  // ── User tab — Manage SSH keys section ───────────────────────────────────────

  test('SSH key management allows saving a public key to a project namespace', async ({
    k8sClient,
    settingsPage,
    pageCommons,
    testConfig,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'ssh-keys'],
    });

    const testNamespace = utils.EnvVariables.testNamespace || testConfig.testNamespace;

    await pageCommons.switchProject(testNamespace);

    const publicKeyPath = utils.SshKeyFactory.generatePublicKeyFile('rsa.pub');
    await settingsPage.navigateToSSHKeysManagement();

    const sshKeyVisible = await settingsPage.verifyPublicSSHKeyVisible();
    expect.soft(sshKeyVisible, 'Public SSH key text visible').toBe(true);

    await settingsPage.selectProjectInSSHSettings(testNamespace);

    const secretName = utils.generateRandomName('ssh-key');
    const sshKeySaved = await settingsPage.saveSSHKey(secretName, publicKeyPath);
    if (sshKeySaved) {
      k8sClient.trackResource('Secret', secretName, testNamespace);
    }
    expect.soft(sshKeySaved, 'SSH key saved successfully').toBe(true);
  });

  // ── User tab — Permissions section ──────────────────────────────────────────

  test(
    'User settings permissions section shows expected tasks',
    { tag: ['@nonpriv'] },
    async ({ settingsPage, utils }) => {
      utils.withAllure({ suite: SUITE, feature: CNV_SETTINGS_FEATURE, tags: [CNV_SETTINGS_TAG] });

      await settingsPage.navigateToPermissions();

      const permissionsVisible = await settingsPage.verifyUserPermissions();
      expect(permissionsVisible, 'User permissions section should be visible').toBe(true);
    },
  );

  // ── User tab — Getting started resources section ─────────────────────────────

  test('Getting started resources section shows Welcome information and Guided tour options', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'getting-started'],
    });

    const loaded = await settingsPage.navigateToGettingStartedResources();
    expect(loaded, 'Getting started resources section should load').toBe(true);
  });

  test('Welcome information and Guided tour toggles are present and responsive', async ({
    settingsPage,
    utils,
  }) => {
    utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG, 'getting-started'],
    });

    await settingsPage.navigateToGettingStartedResources();

    const welcomeEnabled = await settingsPage.enableWelcomeInformation();
    expect.soft(welcomeEnabled, 'Welcome information toggle should respond').toBe(true);

    const guidedTourEnabled = await settingsPage.enableGuidedTour();
    expect.soft(guidedTourEnabled, 'Guided tour toggle should respond').toBe(true);
  });
});
