/**
 * Template list page — filtering and display.
 * Mirrors: cypress/tests/gating/template-list.cy.ts
 */
import { test } from '../../fixtures';
import { env } from '../../utils/env';

const NS = env.testNamespace;

const CENTOSSTREAM9 = 'centos-stream9-server-small';
const CENTOSSTREAM10 = 'centos-stream10-server-small';
const RHEL9 = 'rhel9-server-small';
const RHEL8 = 'rhel8-server-small';
const RHEL7 = 'rhel7-server-small';
const FEDORA = 'fedora-server-small';
const WIN10 = 'windows10-desktop-medium';
const WIN2K22 = 'windows2k22-server-medium';

test.describe('Template list page', () => {
  test.beforeEach(async ({ loginPage, templatesPage }) => {
    if (!NS) test.skip();
    await templatesPage.navigate(); // all-namespaces by default
  });

  test('filter template by name', async ({ templatesPage }) => {
    await templatesPage.filterByName(CENTOSSTREAM9);
    await templatesPage.expectTemplateVisible(CENTOSSTREAM9);
    await templatesPage.expectTemplateNotVisible(CENTOSSTREAM10);
  });

  test('filter by template type', async ({ templatesPage }) => {
    await templatesPage.filterByType('templates');
    await templatesPage.expectTemplateVisible(RHEL9);
    await templatesPage.expectTemplateVisible(FEDORA);
    await templatesPage.expectTemplateVisible(WIN10);
  });

  test('filter templates by OS', async ({ templatesPage }) => {
    await templatesPage.filterByType('windows');
    await templatesPage.expectTemplateNotVisible(RHEL9);
    await templatesPage.expectTemplateNotVisible(RHEL8);
    await templatesPage.expectTemplateNotVisible(RHEL7);
    await templatesPage.expectTemplateVisible(WIN2K22);
  });

  test.skip('filter templates by Provider', async ({ templatesPage }) => {
    await templatesPage.filterByType('Other');
    await templatesPage.expectTemplateNotVisible(RHEL9);
    await templatesPage.expectTemplateNotVisible(WIN10);
  });

  test('template without auto-bootsource has no Source available label', async ({
    templatesPage,
  }) => {
    await templatesPage.filterByName('windows');
    await templatesPage.expectNoSourceAvailableLabel();
  });
});
