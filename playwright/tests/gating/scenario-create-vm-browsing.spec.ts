import { GATING, GATING_TAG } from '@/data-models/allure-constants';
import { expect, test } from '@/fixtures/gating-fixture';

const SUITE = 'VM Creation browsing';

test.describe('VM Creation browsing (gating)', { tag: [GATING_TAG] }, () => {
  test('Template catalog provider filter shows Red Hat templates and hides others', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.filterByProvider('Red Hat', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 visible under Red Hat provider',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.FEDORA),
        'Fedora visible under Red Hat provider',
      )
      .toBe(true);
    await createVmPage.filterByProvider('Red Hat', false);

    await createVmPage.filterByProvider('Other', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 should NOT be visible under Other provider',
      )
      .toBe(false);
    await createVmPage.filterByProvider('Other', false);
  });

  test('Template catalog supports grid and list view switching', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.switchView('list');
    const listVisible = await createVmPage.verifyTemplateVisibleInListView(
      utils.TEMPLATE_DISPLAY_NAMES.RHEL8,
    );
    expect.soft(listVisible, 'RHEL 8 visible in list view').toBe(true);

    await createVmPage.switchView('grid');
    const gridVisible = await createVmPage.verifyTemplateCardVisible(
      utils.TEMPLATE_DISPLAY_NAMES.RHEL8,
    );
    expect.soft(gridVisible, 'RHEL 8 visible in grid view').toBe(true);
  });

  test('Template catalog filters by OS name show correct templates', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.filterByOSName('RHEL', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.RHEL8),
        'RHEL 8 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.RHEL9),
        'RHEL 9 visible',
      )
      .toBe(true);
    await createVmPage.filterByOSName('RHEL', false);

    if (!utils.EnvVariables.isS390x) {
      await createVmPage.filterByOSName('Windows', true);
      expect
        .soft(
          await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.WIN11),
          'Windows 11 visible',
        )
        .toBe(true);
      expect
        .soft(
          await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.WIN2K22),
          'Windows Server 2022 visible',
        )
        .toBe(true);
      await createVmPage.filterByOSName('Windows', false);
    }

    await createVmPage.filterByOSName(utils.OS_FILTERS.FEDORA, true);
    const fedoraCount = await createVmPage.countTemplateCards(utils.TEMPLATE_DISPLAY_NAMES.FEDORA);
    expect.soft(fedoraCount, 'Fedora template count should be 1').toBe(1);
    await createVmPage.filterByOSName(utils.OS_FILTERS.FEDORA, false);
  });

  test('Template catalog text search narrows results to matching templates', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.searchTemplate(utils.TEMPLATE_METADATA_NAMES.RHEL8);

    const visible = await createVmPage.verifyTemplateCardVisible(
      utils.TEMPLATE_DISPLAY_NAMES.RHEL8,
    );
    expect.soft(visible, 'RHEL 8 visible after text filtering').toBe(true);
  });

  test('Template catalog boot source filter shows only templates with available source', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.searchTemplate('');
    await createVmPage.filterByBootSourceAvailable(true);

    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.RHEL8),
        'RHEL 8 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.RHEL9),
        'RHEL 9 visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.FEDORA),
        'Fedora visible',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_DISPLAY_NAMES.CENTOS_STREAM_9),
        'CentOS Stream 9 visible',
      )
      .toBe(true);
    await createVmPage.filterByBootSourceAvailable(false);
  });

  test('Template catalog combined OS and provider filters refine results correctly', async ({
    createVmPage,
    vmListPage,
    vmWizardNavigationPage,
    utils,
  }) => {
    test.skip(utils.EnvVariables.isS390x, 'Windows templates not available on s390x');
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
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
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.WIN11),
        'Windows 11 visible with Windows+Red Hat filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.WIN2K22),
        'Windows Server 2022 visible with Windows+Red Hat filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 should NOT be visible with Windows OS filter active',
      )
      .toBe(false);
    await createVmPage.filterByOSName('Windows', false);

    // Red Hat provider + RHEL OS → only RHEL templates, no Windows
    await createVmPage.filterByOSName('RHEL', true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.RHEL9),
        'RHEL 9 visible with RHEL OS + Red Hat provider filters',
      )
      .toBe(true);
    expect
      .soft(
        await createVmPage.verifyTemplateCardVisible(utils.TEMPLATE_METADATA_NAMES.WIN11),
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
    utils,
  }) => {
    await utils.withAllure({ suite: SUITE, feature: GATING, tags: [GATING_TAG] });
    await vmListPage.navigateToVirtualMachinesViaUI();
    await vmWizardNavigationPage.openWizardFromCreateDropdown();
    await vmWizardNavigationPage.selectCreationMethod('fromTemplate');
    await vmWizardNavigationPage.ensureVmNameFilled();
    await vmWizardNavigationPage.clickNext();

    await createVmPage.clickAllTemplatesButton();

    const visible = await createVmPage.verifyTemplateCardVisible(
      utils.TEMPLATE_DISPLAY_NAMES.CENTOS_STREAM_9,
    );
    expect.soft(visible, 'CentOS Stream 9 visible after showing all').toBe(true);
  });
});
