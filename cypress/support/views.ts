export const submitButton = 'button[type=submit]';
export const masthead = {
  clickMastheadLink: (path: string) => {
    return cy.byTestID(path).click();
  },
  username: {
    shouldBeVisible: () =>
      cy
        .byTestID(Cypress.env('BRIDGE_KUBEADMIN_PASSWORD') ? 'user-dropdown' : 'username')
        .should('be.visible'),
    shouldHaveText: (text: string) =>
      cy
        .byTestID(Cypress.env('BRIDGE_KUBEADMIN_PASSWORD') ? 'user-dropdown' : 'username')
        .should('have.text', text),
  },
};
