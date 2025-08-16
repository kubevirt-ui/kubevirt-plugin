import { YAML } from '../../utils/const/string';
import {
  closeACMBtn,
  clusterDropdown,
  itemCreateBtn,
  itemText,
  saveBtn,
} from '../../views/selector-common';
import { tab } from '../../views/tab';

const ACMTreeviewID = '#kubevirtACMTreeview';
const checkbox = 'input[type="checkbox"]';

describe('Cluster Test Preparation', () => {
  before(() => {
    cy.login();
  });

  it('switch to local-cluster', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Managing clusters')) {
        cy.get(closeACMBtn).click();
        cy.get(clusterDropdown).click();
        cy.contains(itemText, 'local-cluster').click();
      }
    });
  });

  it('enable acm flag', () => {
    cy.switchToAdmin();
    cy.visitVMs();
    cy.visitOverview();
    tab.navigateToSettings();

    cy.byButtonText('Preview features').click();
    cy.get(ACMTreeviewID).find(checkbox).check({ force: true });
  });

  it('switch to Fleet Virtualization', () => {
    cy.switchToFleetVirt();
  });

  it('create example VM', () => {
    cy.visitVMs();
    cy.get(itemCreateBtn, { timeout: 60000 }).click();
    cy.byButtonText(YAML).click();
    cy.get(saveBtn).click();
  });
});
