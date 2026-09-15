import { CNV_SETTINGS_FEATURE, CNV_SETTINGS_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/settings-fixture';

const SUITE = 'SSH Configuration Settings';

test.describe(SUITE, { tag: [CNV_SETTINGS_TAG, '@adminOnly'] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.navigateToSettingsViaSidebar();
  });

  test('SSH over NodePort requires a node address and resets when the address is cleared', async ({
    settingsPage,
    apiClient,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: CNV_SETTINGS_FEATURE,
      tags: [CNV_SETTINGS_TAG],
    });

    const featuresConfigMap = await apiClient.getConfigMap(
      'kubevirt-ui-features',
      utils.EnvVariables.cnvNamespace,
    );
    const originalData = featuresConfigMap?.data as Record<string, string> | undefined;
    const originalNodePortAddress = originalData?.nodePortAddress;
    const originalNodePortEnabled = originalData?.nodePortEnabled;

    try {
      await apiClient.mergePatchResource(
        '',
        'v1',
        'configmaps',
        'kubevirt-ui-features',
        { data: { nodePortAddress: '', nodePortEnabled: 'false' } },
        utils.EnvVariables.cnvNamespace,
      );

      await settingsPage.openSSHOverNodePortConfiguration();

      await expect
        .poll(() => settingsPage.isSSHOverNodePortEnabled(), {
          message: 'NodePort switch should be disabled while the node address is empty',
        })
        .toBe(false);

      await settingsPage.setSSHOverNodePortAddress('worker.example.com');

      await expect
        .poll(() => settingsPage.isSSHOverNodePortEnabled(), {
          message: 'NodePort switch should be enabled after entering a node address',
        })
        .toBe(true);

      await settingsPage.setSSHOverNodePortEnabled(true);
      await expect
        .poll(() => settingsPage.isSSHOverNodePortChecked(), {
          message: 'NodePort switch should be checked after it is enabled',
        })
        .toBe(true);

      await settingsPage.setSSHOverNodePortAddress('');

      await expect
        .poll(() => settingsPage.isSSHOverNodePortChecked(), {
          message: 'NodePort switch should turn off after clearing the node address',
        })
        .toBe(false);
      await expect
        .poll(() => settingsPage.isSSHOverNodePortEnabled(), {
          message: 'NodePort switch should be disabled after clearing the node address',
        })
        .toBe(false);
    } finally {
      await apiClient.mergePatchResource(
        '',
        'v1',
        'configmaps',
        'kubevirt-ui-features',
        {
          data: {
            nodePortAddress: originalNodePortAddress ?? null,
            nodePortEnabled: originalNodePortEnabled ?? null,
          },
        },
        utils.EnvVariables.cnvNamespace,
      );
    }
  });
});
