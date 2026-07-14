import { load as yamlLoad } from 'js-yaml';

import { T1, T1_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/templates-fixture';
import { buildTemplateDetailResource } from '@/utils/template-test-helpers';
import { setupTestNamespace } from '@/utils/test-setup-helpers';

const SUITE = 'Template detail tabs';

test.describe(SUITE, { tag: [T1_TAG, '@tier1-templates'] }, () => {
  test(
    'Template creation and project filtering',
    { tag: ['@adminOnly'] },
    async ({
      createVmPage,
      vmListPage,
      vmWizardNavigationPage,
      templatesPage,
      k8sClient,
      testConfig,
      utils,
    }) => {
      test.skip(
        utils.EnvVariables.isNonPrivUser,
        'Requires admin: creates template CRDs in test namespace',
      );
      await utils.withAllure({
        suite: SUITE,
        feature: T1,
        tags: [T1_TAG, '@adminOnly'],
      });
      const namespace = testConfig?.testNamespace || utils.EnvVariables.testNamespace;

      await templatesPage.navigateToNamespaceTemplatesViaUI(namespace);

      const exampleTemplateName = utils.generateRandomTemplateName('example');
      await templatesPage.clickCreateTemplate();
      await templatesPage.setCreateTemplateExampleNameInYamlEditor(exampleTemplateName);
      await templatesPage.clickCreateButtonInModal();
      k8sClient.trackResource('Template', exampleTemplateName, namespace);

      const templateNameUser = utils.generateRandomTemplateName('user-template');
      const templateDisplayNameUser = `user-template ${utils.generateRandomString(
        8,
        'alphanumeric',
      )}`;
      const userTplResource = utils.TemplateFactory.createResourceObject({
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

      const templateNameProject = utils.generateRandomTemplateName('default-template');
      const templateDisplayNameProject = `default-template ${utils.generateRandomString(
        8,
        'alphanumeric',
      )}`;
      const templateYaml = utils.TemplateFactory.create({
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
          utils.TEMPLATE_DISPLAY_NAMES.FEDORA,
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
        const visible = await createVmPage.verifyTemplateCardVisible(templateNameUser);
        expect.soft(visible, 'User-provided template visible').toBe(true);
      });

      await test.step('Template visible per project', async () => {
        const verifyResult = await k8sClient.verifyTemplateCreated(templateNameProject, namespace);
        expect.soft(verifyResult.exists, `Template ${templateNameProject} exists`).toBe(true);

        await createVmPage.selectProjectFromCatalog(namespace);
        await createVmPage.clickUserProvidedTab();
        const visible = await createVmPage.verifyTemplateCardVisible(templateNameProject);
        expect.soft(visible, 'Example template visible in project namespace').toBe(true);
      });
    },
  );

  test('Custom template detail page shows all tabs with expected content', async ({
    k8sClient,
    overviewPage,
    templatesPage,
    templateDetailPage,
    pageCommons,
    utils,
  }) => {
    await utils.withAllure({
      suite: SUITE,
      feature: T1,
      tags: [T1_TAG, 'template-tabs'],
    });

    const namespace = await setupTestNamespace(k8sClient, 't1-tpl-detail');
    const templateName = utils.generateRandomTemplateName('t1-tpl-tabs');

    const templateResource = buildTemplateDetailResource(templateName, namespace);

    await k8sClient.createCustomResource(
      'template.openshift.io',
      'v1',
      namespace,
      'templates',
      templateResource,
    );
    k8sClient.trackResource('Template', templateName, namespace);

    await overviewPage.navigateToVirtualizationOverviewViaUI();
    await templatesPage.navigateToTemplatesViaUI();
    await pageCommons.switchProject(namespace);

    const pageLoaded = await templatesPage.verifyPageLoaded(templateName);
    expect.soft(pageLoaded, 'Templates page should load').toBe(true);

    await templatesPage.filterTemplatesByName(templateName);
    await templatesPage.clickTemplateByTestId(templateName);

    expect.soft(await templateDetailPage.verifyDisplayName(), 'Display name visible').toBe(true);

    await templateDetailPage.navigateToYAML();
    expect.soft(await templateDetailPage.verifyDownload(), 'YAML download visible').toBe(true);

    await templateDetailPage.navigateToScheduling();
    expect.soft(await templateDetailPage.verifyTolerations(), 'Tolerations visible').toBe(true);

    await templateDetailPage.navigateToNetworks();
    expect
      .soft(await templateDetailPage.verifyPodNetworking(), 'Pod networking visible')
      .toBe(true);

    await templateDetailPage.navigateToDisks();
    expect.soft(await templateDetailPage.verifyContainerDisk(), 'containerdisk visible').toBe(true);

    await templateDetailPage.navigateToScripts();
    expect.soft(await templateDetailPage.verifyCloudInit(), 'Cloud-init visible').toBe(true);

    await templateDetailPage.navigateToParameters();
    expect
      .soft(await templateDetailPage.verifyCloudUserPassword(), 'CLOUD_USER_PASSWORD visible')
      .toBe(true);
  });
});
