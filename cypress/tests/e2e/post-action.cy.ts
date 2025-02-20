import { MINUTE } from '../../utils/const/index';

describe('Holding cluster', () => {
  it('wait 100 minutes', () => {
    cy.wait(100 * MINUTE);
  });
});
