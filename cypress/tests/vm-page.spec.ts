describe('Tests VM List page', () => {
  before(() => {
    cy.login();
    cy.visit('/');
  });

  after(() => {
    cy.logout();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.clickNavLink(['Virtualization', 'VirtualMachines']);
  });

  it('Test creation of VM', () => {
    cy.byTestID('item-create').click();
  });
});
