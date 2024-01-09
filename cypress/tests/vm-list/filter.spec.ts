import { TEST_NS } from '../../utils/const/index';
import { defaultSourceVM } from '../../utils/const/testVM';
import { vmListSearchBar, vmListToolbar } from '../../views/selector';
import { vm } from '../../views/vm';

const NON_EXISTING_IP = '192.1.1.1';
const NON_EXISTING_VM_NAME = 'vm-name-does-not-exist';

describe('Test VM catalog filter', () => {
  before(() => {
    cy.login();
    cy.visitVMs();
  });

  it('Filter VMs using the search filter with different search types', () => {
    cy.newProject(TEST_NS);
    cy.selectProject(TEST_NS);
    vm.create(defaultSourceVM);
    cy.visitVMs();
    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');

    cy.get(vmListSearchBar).type(NON_EXISTING_VM_NAME);

    cy.byLegacyTestID(defaultSourceVM.name).should('not.exist');

    cy.get(vmListSearchBar).clear();

    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');

    cy.get(vmListToolbar).contains('button', 'Name').click();

    cy.get('li').contains('IP Address').click();

    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');

    cy.get(vmListSearchBar).clear().type(NON_EXISTING_IP);

    cy.byLegacyTestID(defaultSourceVM.name).should('not.exist');
    cy.get(vmListSearchBar).clear();
    cy.byLegacyTestID(defaultSourceVM.name).should('be.visible');
  });
});
