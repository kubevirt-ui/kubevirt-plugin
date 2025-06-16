import { TEST_NS } from '../../utils/const/index';
import { Example } from '../../utils/const/string';
import { colName, favName } from '../../views/actions';
import * as cView from '../../views/selector-catalog';
import { filterBtn, filterByName } from '../../views/selector-instance';
import { cardTitleV6 } from '../../views/selector-overview';

describe('Test filter in InstanceType', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitCatalogVirt();
  });

  it('test hint in InstanceTypes boot volume', () => {
    cy.contains('Select volume to boot from').find('svg').click();
    cy.contains(
      'From the Volume table, select a bootable volume to boot your VirtualMachine',
    ).should('be.visible');
  });

  it('mark volume favorite ', () => {
    cy.get('table.BootableVolumeList-table')
      .find('tbody')
      .within(() => {
        cy.get('tr').last().find(favName).find('button').click();
        cy.get('tr').first().should('contain', 'fedora');
        cy.get('tr').last().find(favName).find('button').click();
        cy.get('tr').first().should('contain', 'centos-stream9');
      });
    cy.get('button[aria-label="Sort favorites"]').click();
    cy.get('table.BootableVolumeList-table')
      .find('tbody')
      .within(() => {
        cy.get('tr').last().should('contain', 'fedora');
        // restore favorites
        cy.get('tr').last().find(favName).find('button').click();
        cy.get('tr').last().find(favName).find('button').click();
      });
  });

  it('filter volume by OS', () => {
    cy.get(filterBtn).click();
    cy.get('[data-test-row-filter="fedora"]').click();
    cy.contains('Volume name').click();
    cy.contains('Select volume to boot from').scrollIntoView();
    cy.contains(colName, 'fedora').should('exist');
    cy.contains(colName, 'centos').should('not.exist');
  });

  it('filter volume by name', () => {
    cy.byButtonText('Clear all filters').click();
    cy.get(filterByName).type('fedora');
    cy.contains(colName, 'fedora').should('exist');
    cy.contains(colName, 'centos').should('not.exist');
  });

  xit('check instanceType class in catalog', () => {
    cy.byButtonText('User').click();
    cy.get('input[aria-label="Filter menu items"]').clear().type('.small');
    cy.contains('n1').should('not.exist');
    cy.contains('o1').should('exist');
    cy.contains('u1').should('exist');
    cy.contains('mcx1').should('not.exist');
    cy.contains('rt1').should('exist');
    cy.get('input[aria-label="Filter menu items"]').clear().type('.medium');
    cy.contains('n1').should('exist');
    cy.contains('o1').should('exist');
    cy.contains('u1').should('exist');
    cy.contains('cx1').should('exist');
    cy.contains('rt1').should('exist');
  });
});

describe('Test filter in Templates', () => {
  it('visit catalog template tab', () => {
    cy.get(cView.templateTab).click();
  });

  it('filter VM catalog by OS name', () => {
    cy.get(cView.CENTOS).find(cView.checkbox).check();
    cy.get(cView.GRID)
      .find(cardTitleV6)
      .should('not.contain', 'Fedora')
      .and('not.contain', 'Red Hat');
    cy.get(cView.CENTOS).find(cView.checkbox).uncheck();
    cy.get(cView.RHEL).find(cView.checkbox).check();
    cy.get(cView.GRID)
      .find(cardTitleV6)
      .should('not.contain', 'Fedora')
      .and('not.contain', 'Centos');
    cy.get(cView.RHEL).find(cView.checkbox).uncheck();
  });

  it('filter VM catalog by Workload', () => {
    cy.get(cView.DESKTOP).find(cView.checkbox).check();
    cy.get(cView.GRID).find(cardTitleV6).should('not.contain', 'CentOS');
    cy.get(cView.DESKTOP).find(cView.checkbox).uncheck();
    cy.get(cView.SERVER).find(cView.checkbox).check();
    cy.get(cView.GRID).find(cardTitleV6).should('contain', 'CentOS').and('contain', 'Fedora');
    cy.get(cView.SERVER).find(cView.checkbox).uncheck();
  });

  it('filter VM catalog by text', () => {
    cy.get(cView.filterText).type('fedora-server-small');
    cy.get(cView.GRID).find(cardTitleV6).should('not.contain', 'CentOS Stream');
    cy.get(cView.GRID).find(cardTitleV6).should('not.contain', 'Microsoft Windows');
    cy.get(cView.GRID).find(cardTitleV6).should('not.contain', 'Red Hat Enterprise Linux');
    cy.get(cView.GRID).find(cardTitleV6).should('contain', 'Fedora');
    cy.get(cView.filterText).clear();
  });

  it('filter VM catalog by template boot source', () => {
    cy.get(cView.BootSource).find(cView.checkbox).check();
    cy.get(cView.GRID).find(cardTitleV6).should('contain', 'CentOS Stream 9');
    cy.get(cView.BootSource).find(cView.checkbox).uncheck();
  });

  it('switch between grid and list view', () => {
    cy.get(cView.listBtn).click();
    cy.contains('Fedora').should('exist');
  });

  it('check user templates', () => {
    cy.get(cView.uTemplate).click();
    cy.contains('Fedora').should('exist');
    cy.contains('example').should('exist');
  });

  it('show all templates', () => {
    cy.get(cView.allItems).click();
    cy.contains('CentOS Stream 9').should('exist');
  });

  it('check templates per project', () => {
    cy.get('.templates-catalog-project-dropdown').find('button').click();
    cy.contains('.pf-v6-c-menu__item-text', TEST_NS).click();
    cy.contains(Example).should('exist');
  });
});
