import { TEMPLATE } from '../../utils/const/template';
import * as catalogView from '../../views/catalog';

describe('Test VM catalog filter', () => {
  before(() => {
    cy.login();
    cy.clickNavLink(['Virtualization', 'Catalog']);
  });

  it('ID(CNV-8464) Filter VM catalog by OS name', () => {
    cy.get(catalogView.RHEL).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 4);
    cy.get(catalogView.RHEL).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);

    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 4);
    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);

    cy.get(catalogView.FEDORA).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 1);
    cy.get(catalogView.FEDORA).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);

    cy.get(catalogView.CENTOS).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 3);
    cy.get(catalogView.CENTOS).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);
  });

  it('ID(CNV-8465) Filter VM catalog by Workload', () => {
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 1);
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);

    cy.get(catalogView.SERVER).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 11);
    cy.get(catalogView.SERVER).find(catalogView.checkbox).uncheck();
    cy.get(catalogView.GRID).find('a').should('have.length', 12);
  });

  it('ID(CNV-8466) Filter VM catalog by OS and Workload', () => {
    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 4);

    cy.get(catalogView.SERVER).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 3);
    cy.get(catalogView.SERVER).find(catalogView.checkbox).uncheck();

    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).check();
    cy.get(catalogView.GRID).find('a').should('have.length', 1);
    cy.get(catalogView.DESKTOP).find(catalogView.checkbox).uncheck();

    cy.get(catalogView.WINDOWS).find(catalogView.checkbox).uncheck();
  });

  it('ID(CNV-8467) Filter VM catalog by text', () => {
    cy.get(catalogView.filterText).type(TEMPLATE.RHEL9.name);
    cy.contains(TEMPLATE.RHEL9.name).should('exist');
    cy.get(catalogView.GRID).find('a').should('have.length', 1);

    cy.get(catalogView.filterText).clear().type(TEMPLATE.FEDORA.metadataName);
    cy.contains(TEMPLATE.FEDORA.name).should('exist');
    cy.get(catalogView.GRID).find('a').should('have.length', 1);
  });
});
