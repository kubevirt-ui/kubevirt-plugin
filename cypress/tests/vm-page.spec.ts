describe('Tests VM List page', () => {
  before(() => {
    cy.login();
    cy.visit('/');
    // cy.install();
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
