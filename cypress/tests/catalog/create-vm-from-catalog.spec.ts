import { K8S_KIND, TEST_NS } from '../../utils/const/index';
import { defaultSourceVM } from '../../utils/const/testVM';
import { vm } from '../../views/vm';

describe('Create VM from catalog', () => {
  before(() => {
    cy.login();
    cy.deleteResource(K8S_KIND.VM, defaultSourceVM.name, TEST_NS);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.VM, defaultSourceVM.name, TEST_NS);
  });

  it('ID(CNV-) Create VM from default source', () => {
    cy.newProject(TEST_NS);
    cy.selectProject(TEST_NS);
    vm.create(defaultSourceVM);
    cy.visitVMs();
    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');
  });
});
