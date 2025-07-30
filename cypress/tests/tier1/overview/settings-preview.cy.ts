import { adminOnlyDescribe } from '../../../utils/const/index';
import { previewFeaturesTxt } from '../../../views/selector-instance';
import { tab } from '../../../views/tab';

const treeView = '#treeViewFolders';
const advSearch = '#advancedSearch';

adminOnlyDescribe('Test Preview features', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  it('navigato to preview feature page', () => {
    tab.navigateToSettings();
    cy.byButtonText(previewFeaturesTxt).click();
    cy.contains('h5', previewFeaturesTxt).should('be.visible');
  });

  it('test VM folders settings', () => {
    cy.get(treeView).find(':checkbox').should('be.checked');
    cy.get(treeView, { timeout: 60000 }).find(':checkbox').uncheck({ force: true });
    cy.get(treeView).find(':checkbox').should('not.be.checked');
    cy.get(treeView, { timeout: 60000 }).find(':checkbox').check({ force: true });
    cy.get(treeView).find(':checkbox').should('be.checked');
  });

  it('test VM advanced search  settings', () => {
    cy.get(advSearch).find(':checkbox').should('be.checked');
    cy.get(advSearch, { timeout: 60000 }).find(':checkbox').uncheck({ force: true });
    cy.get(advSearch).find(':checkbox').should('not.be.checked');
    cy.get(advSearch, { timeout: 60000 }).find(':checkbox').check({ force: true });
    cy.get(advSearch).find(':checkbox').should('be.checked');
  });
});
