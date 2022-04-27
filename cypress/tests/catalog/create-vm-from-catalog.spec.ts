import { K8S_KIND, TEST_NS, VM_STATUS } from '../../utils/const/index';
import { defaultSourceVM, urlSourceVM } from '../../utils/const/testVM';
import { vm } from '../../views/vm';

describe('Create VM from catalog', () => {
  before(() => {
    cy.login();
    cy.deleteResource(K8S_KIND.VM, defaultSourceVM.name, TEST_NS);
    cy.deleteResource(K8S_KIND.VM, urlSourceVM.name, TEST_NS);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, defaultSourceVM.name, TEST_NS);
    cy.deleteResource(K8S_KIND.VM, urlSourceVM.name, TEST_NS);
  });

  it('ID(CNV-) Create VM from default source', () => {
    cy.newProject(TEST_NS);
    cy.selectProject(TEST_NS);
    vm.create(defaultSourceVM);
    cy.visitCatalog();
    cy.visitVMs();
    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');
  });

  it('ID(CNV-) Create VM from URL source', () => {
    vm.create(urlSourceVM);
    cy.visitCatalog();
    cy.visitVMs();
    cy.byLegacyTestID(urlSourceVM.name).should('be.visible');
    vm.testStatus(urlSourceVM.name, VM_STATUS.Running);
  });
});
