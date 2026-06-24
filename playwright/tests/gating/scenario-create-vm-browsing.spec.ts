import { load as yamlLoad } from 'js-yaml';

import { TemplateFactory } from '@/data-factories/template-factory';
import { OS_FILTERS, TEMPLATE_DISPLAY_NAMES } from '@/data-models/constants';
import { GATING_TAG } from '@/data-models/test-tags';
import { expect, test } from '@/fixtures/gating-fixture';
import { EnvVariables } from '@/utils/env-variables';
import { TEMPLATE_METADATA_NAMES } from '@/utils/template-constants';

test.describe('VM Creation browsing (gating)', { tag: [GATING_TAG] }, () => {
  test('Template catalog provider filter shows Red Hat templates and hides others', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.filterByProvider('Red Hat', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 visible under Red Hat provider',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.FEDORA),
        'Fedora visible under Red Hat provider',
      )
      .toBe(true);
    await createVmPage.filterByProvider('Red Hat', false);

    await createVmPage.filterByProvider('Other', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 should NOT be visible under Other provider',
      )
      .toBe(false);
    await createVmPage.filterByProvider('Other', false);
  });

  test('Template catalog supports grid and list view switching', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.switchView('list');
    const listVisible = await createVmPage.verifyTemplateVisibleInListView(
      TEMPLATE_DISPLAY_NAMES.RHEL8,
    );
    expect.soft(listVisible, 'RHEL 8 visible in list view').toBe(true);

    await createVmPage.switchView('grid');
    const gridVisible = await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL8);
    expect.soft(gridVisible, 'RHEL 8 visible in grid view').toBe(true);
  });

  test('Template catalog filters by OS name show correct templates', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.filterByOSName('RHEL', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL8),
        'RHEL 8 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL9),
        'RHEL 9 visible',
      )
      .toBe(true);
    await createVmPage.filterByOSName('RHEL', false);

    if (!EnvVariables.isS390x) {
      await createVmPage.filterByOSName('Windows', true);
      expect
        .soft(
          await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.WIN11),
          'Windows 11 visible',
        )
        .toBe(true);
      expect
        .soft(
          await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.WIN2K22),
          'Windows Server 2022 visible',
        )
        .toBe(true);
      await createVmPage.filterByOSName('Windows', false);
    }

    await createVmPage.filterByOSName(OS_FILTERS.FEDORA, true);
    const fedoraCount = await createVmPage.countTemplateCards(TEMPLATE_DISPLAY_NAMES.FEDORA);
    expect.soft(fedoraCount, 'Fedora template count should be 1').toBe(1);
    await createVmPage.filterByOSName(OS_FILTERS.FEDORA, false);
  });

  test('Template catalog text search narrows results to matching templates', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.searchTemplate(TEMPLATE_METADATA_NAMES.RHEL8);

    const visible = await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL8);
    expect.soft(visible, 'RHEL 8 visible after text filtering').toBe(true);
  });

  test('Template catalog boot source filter shows only templates with available source', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.searchTemplate('');
    await createVmPage.filterByBootSourceAvailable(true);

    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL8),
        'RHEL 8 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.RHEL9),
        'RHEL 9 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.FEDORA),
        'Fedora visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_DISPLAY_NAMES.CENTOS_STREAM_9),
        'CentOS Stream 9 visible',
      )
      .toBe(true);
    await createVmPage.filterByBootSourceAvailable(false);
  });

  test('Template catalog combined OS and provider filters refine results correctly', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    test.skip(EnvVariables.isS390x, 'Windows templates not available on s390x');
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    // Windows OS + Red Hat provider → only Windows templates from Red Hat
    await createVmPage.filterByOSName('Windows', true);
    await createVmPage.filterByProvider('Red Hat', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.WIN11),
        'Windows 11 visible with Windows+Red Hat filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.WIN2K22),
        'Windows Server 2022 visible with Windows+Red Hat filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 should NOT be visible with Windows OS filter active',
      )
      .toBe(false);
    await createVmPage.filterByOSName('Windows', false);

    // Red Hat provider + RHEL OS → only RHEL templates, no Windows
    await createVmPage.filterByOSName('RHEL', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 visible with RHEL OS + Red Hat provider filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(TEMPLATE_METADATA_NAMES.WIN11),
        'Windows 11 should NOT be visible with RHEL OS filter active',
      )
      .toBe(false);
    await createVmPage.filterByOSName('RHEL', false);
    await createVmPage.filterByProvider('Red Hat', false);
  });

  test('Template catalog "All templates" button reveals all available templates', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
  }) => {
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.clickAllTemplatesButton();

    const visible = await createVmPage.verifyTemplateCardVisible(
      TEMPLATE_DISPLAY_NAMES.CENTOS_STREAM_9,
    );
    expect.soft(visible, 'CentOS Stream 9 visible after showing all').toBe(true);
  });

  test(
    'Template creation and project filtering',
    { tag: ['@adminOnly'] },
    async ({
      createVmPage,
      generators,
      k8sClient,
      templatesPage,
      testConfig,
      vmListPage,
      vmWizardNavigationPage,
    }) => {
      test.skip(
        EnvVariables.isNonPrivUser,
        'Requires admin: creates template CRDs in test namespace',
      );
      const namespace = testConfig?.testNamespace || EnvVariables.testNamespace;

      await templatesPage.navigateToNamespaceTemplatesViaUI(namespace);

      const exampleTemplateName = generators.randomTemplateName('example');
      await templatesPage.clickCreateTemplate();
      await templatesPage.setCreateTemplateExampleNameInYamlEditor(exampleTemplateName);
      await templatesPage.clickCreateButtonInModal();
      k8sClient.trackResource('Template', exampleTemplateName, namespace);

      const templateNameUser = generators.randomTemplateName('user-template');
      const templateDisplayNameUser = `user-template ${generators.randomString(8, 'alphanumeric')}`;
      const userTplResource = TemplateFactory.createResourceObject({
        description: 'Test user-provided template for catalog filter test',
        displayName: templateDisplayNameUser,
        name: templateNameUser,
        namespace,
      });
      await k8sClient.createCustomResource(
        'template.openshift.io',
        'v1',
        namespace,
        'templates',
        userTplResource,
      );
      k8sClient.trackResource('Template', templateNameUser, namespace);

      const templateNameProject = generators.randomTemplateName('default-template');
      const templateDisplayNameProject = `default-template ${generators.randomString(
        8,
        'alphanumeric',
      )}`;
      const templateYaml = TemplateFactory.create({
        customLabels: { 'template.openshift.io/provider': 'default' },
        displayName: templateDisplayNameProject,
        name: templateNameProject,
        namespace,
      });
      const parsedProjectTpl = yamlLoad(templateYaml) as Record<string, unknown>;
      await k8sClient.createCustomResource(
        'template.openshift.io',
        'v1',
        namespace,
        'templates',
        parsedProjectTpl,
      );
      k8sClient.trackResource('Template', templateNameProject, namespace);

      await test.step('Create template from example', async () => {
        const isCreated = await templatesPage.verifyTemplateCreationFromExample('Template details');
        expect.soft(isCreated, 'Template created from example').toBe(true);

        const fedoraVisible = await templatesPage.verifyTemplateCreationFromExample(
          TEMPLATE_DISPLAY_NAMES.FEDORA,
        );
        expect.soft(fedoraVisible, 'Fedora VM template visible').toBe(true);
      });

      await vmListPage.navigateToVirtualMachinesViaUI();
      await vmWizardNavigationPage.openWizardFromCreateDropdown();
      await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
      await vmWizardNavigationPage.ensureVmNameFilled();
      await vmWizardNavigationPage.clickNext();

      await test.step('User template visible in catalog', async () => {
        const verifyResult = await k8sClient.verifyTemplateCreated(templateNameUser, namespace);
        expect.soft(verifyResult.exists, `Template ${templateNameUser} created`).toBe(true);

        await createVmPage.clickUserProvidedTab();
        // CNV 4.99+: cards show metadata name (not display name) — verify by metadata name
        const visible = await createVmPage.verifyTemplateCardVisible(templateNameUser);
        expect.soft(visible, 'User-provided template visible').toBe(true);
      });

      await test.step('Template visible per project', async () => {
        const verifyResult = await k8sClient.verifyTemplateCreated(templateNameProject, namespace);
        expect.soft(verifyResult.exists, `Template ${templateNameProject} exists`).toBe(true);

        await createVmPage.selectProjectFromCatalog(namespace);
        await createVmPage.clickUserProvidedTab();
        // CNV 4.99+: cards show metadata name (not display name) — verify by metadata name
        const visible = await createVmPage.verifyTemplateCardVisible(templateNameProject);
        expect.soft(visible, 'Example template visible in project namespace').toBe(true);
      });
    },
  );
});
