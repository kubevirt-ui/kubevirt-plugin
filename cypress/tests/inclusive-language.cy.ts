const offensiveWords = ['master', 'slave', 'whitelist', 'blacklist'];

describe('Test for offensive language', () => {
  it('Looks for offensive words', () => {
    offensiveWords.forEach((word) => {
      cy.exec(
        `git grep --ignore-case ${word} -- ../*\
         ':(exclude)../cypress/tests/inclusive-language.spec.ts'\
         ':(exclude)../deploy-kubevirt-gating.sh'\
         ':(exclude)../README.md'`,
        {
          failOnNonZeroExit: false,
          timeout: 10000,
        },
      )
        .its('stdout')
        .should('be.empty');
    });
  });
});
