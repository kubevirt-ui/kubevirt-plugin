export const modal = '#virtual-machine-migration-modal';
export const entireVM = 'input[id="all-volumes"]';
export const selectedVolumes = 'input[id="selected-volumes"]';
export const backBtn = 'button.pf-v6-c-button.pf-m-secondary';
export const nextBtn = 'button.pf-v6-c-button.pf-m-primary';
export const selectSCBtn = 'button[placeholder="Select StorageClass"]';
export const checkRow0 = 'input[aria-label="Select row 0"]';
export const closeBtn = '.pf-v6-c-popover__close';

export const storageclassMigrate = (destSC: string) => {
  cy.get(modal).should('be.visible');
  cy.get(nextBtn).click();
  cy.get(backBtn).click(); // verify back button is working
  cy.get(nextBtn).click();
  cy.get(selectSCBtn).click();
  cy.get(`button#select-inline-filter-${destSC}`).click();
  cy.get(nextBtn).click();
  cy.get(nextBtn).click();
  cy.contains(modal, 'In progress').should('exist');
  cy.contains(modal, 'Migration completed successfully', { timeout: 300000 }).should('exist');
  cy.get(closeBtn).click();
};
