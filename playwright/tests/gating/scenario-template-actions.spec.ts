import { GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';

const RHEL9 = 'rhel9-server-small';

test.describe('Template actions (gating)', { tag: [GATING_TAG] }, () => {
  test.beforeEach(async ({ templatesPage }) => {
    await templatesPage.navigateToAllNamespacesTemplates();
    await templatesPage.verifyPageLoaded();
  });

  test('Clone from kebab opens dialog with pre-filled template name and no source selector', async ({
    templatesPage,
  }) => {
    await templatesPage.clickCloneTemplate(RHEL9);

    const dialog = await templatesPage.verifyCloneDialogOpen();
    expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
    expect
      .soft(dialog.hasSourceProjectSelector, 'Should not show source project selector')
      .toBe(false);
    expect
      .soft(dialog.templateNameValue, 'Template name should be pre-filled with a generated name')
      .toContain(RHEL9);
    expect.soft(dialog.cloneEnabled, 'Clone button should be enabled').toBe(true);

    await templatesPage.closeDialog();
  });

  test('"From an existing template" opens Clone modal with source project selector', async ({
    templatesPage,
  }) => {
    await templatesPage.clickCreateTemplateOption('From an existing template');

    const dialog = await templatesPage.verifyCloneDialogOpen();
    expect.soft(dialog.dialogVisible, 'Clone dialog should be visible').toBe(true);
    expect.soft(dialog.hasSourceProjectSelector, 'Should show source project selector').toBe(true);
    expect.soft(dialog.cloneEnabled, 'Clone button should be disabled initially').toBe(false);

    await templatesPage.closeDialog();
  });

  test('"From a virtual machine" navigates to VMs page', async ({ templatesPage }) => {
    await templatesPage.clickCreateTemplateOption('From a virtual machine');

    const navigated = await templatesPage.verifyNavigatedToVmsPage();
    expect(navigated, 'Should navigate to VMs page with tab=vms').toBe(true);
  });

  test('"With YAML" opens YAML editor', async ({ templatesPage }) => {
    await templatesPage.clickCreateTemplateOption('With YAML');

    const editorVisible = await templatesPage.verifyYamlEditorOpen();
    expect(editorVisible, 'YAML editor should be visible').toBe(true);
  });
});
