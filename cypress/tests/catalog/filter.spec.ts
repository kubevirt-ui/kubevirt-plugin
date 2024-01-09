import { TEMPLATE } from '../../utils/const/template';
import * as catalogView from '../../views/catalog';

describe('Test VM catalog filter', () => {
  before(() => {
    cy.login();
    cy.visitCatalog();
    cy.get(catalogView.TEMPLATE_CATALOG).click();
  });

  it('ID(CNV-8464) Filter VM catalog by OS name', () => {
    cy.get(catalogView.RHEL).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.RHEL9.metadataName);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.RHEL8.metadataName);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.RHEL7.metadataName);
    cy.get(catalogView.RHEL).find(catalogView.checkbox).uncheck();

    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN10.name);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K12R2.name);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K16.name);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K19.name);
    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).uncheck();

    cy.get(catalogView.FEDORA).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.FEDORA.metadataName);
    cy.get(catalogView.FEDORA).find(catalogView.checkbox).uncheck();
  });

  it('ID(CNV-8465) Filter VM catalog by Workload', () => {
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN10.name);
    cy.get(catalogView.GRID).find('a').should('not.contain', TEMPLATE.WIN2K19.name);
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).uncheck();
  });

  it('ID(CNV-8466) Filter VM catalog by OS and Workload', () => {
    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).check();
    cy.get(catalogView.SERVER).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K12R2.name);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K16.name);
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN2K19.name);
    cy.get(catalogView.SERVER).find(catalogView.checkbox).uncheck();

    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('contain', TEMPLATE.WIN10.name);
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).uncheck();
  });

  it('ID(CNV-8467) Filter VM catalog by text', () => {
    cy.get(catalogView.filterText).type(TEMPLATE.RHEL8.name);
    cy.contains(TEMPLATE.RHEL8.name).should('exist');
    cy.get(catalogView.GRID).find('a').should('have.length', 1);

    cy.get(catalogView.filterText).clear().type(TEMPLATE.WIN10.metadataName);
    cy.contains(TEMPLATE.WIN10.name).should('exist');
    cy.get(catalogView.GRID).find('a').should('have.length', 1);
  });
});
