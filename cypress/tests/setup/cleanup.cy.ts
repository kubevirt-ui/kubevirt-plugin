import { CLEANUP_SCRIPT, MINUTE } from '../../utils/const/index';

describe('Delete shared resources', () => {
  it('Clean cluster of shared resources', () => {
    cy.exec(CLEANUP_SCRIPT, { timeout: 3 * MINUTE });
  });
});
