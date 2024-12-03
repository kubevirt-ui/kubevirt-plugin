describe('Login before all tests', () => {
  it('login the console', () => {
    cy.login();
  });
});
