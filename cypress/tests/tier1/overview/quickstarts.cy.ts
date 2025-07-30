import { startButton } from '../../../views/selector-overview';

const QS_URL = 'quickstart';
const QS_VM_VOL_TITLE = 'Create a virtual machine from a volume';

describe('Test Quick Starts', () => {
  before(() => {
    cy.beforeSpec();
  });

  it(
    'visit quick start page',
    {
      retries: {
        openMode: 0,
        runMode: 8,
      },
    },
    () => {
      cy.visit(QS_URL);
      cy.wait(20000);
      cy.contains(QS_VM_VOL_TITLE).should('be.visible');
    },
  );

  it('ID(CNV-10174) Test Create VM from volume QS', () => {
    cy.contains(QS_VM_VOL_TITLE).click({
      force: true,
    });
    cy.get('.pfext-quick-start-footer').then(($footer) => {
      if ($footer.find('button[data-testid="qs-drawer-side-note-action"]').length) {
        cy.byButtonText('Restart').click();
      }
    });
    cy.get(startButton).click();
    cy.get('#review-failed').click();
    cy.get('.pf-m-danger').should('exist');
    cy.get('#review-success').click();
    cy.get('.pf-m-danger').should('not.exist');
    cy.get('.pf-m-success').should('exist');
    cy.get('[data-testid="qs-drawer-check-yes"]').check();
    cy.wait(5000);
    cy.byButtonText('Next').click();
    cy.contains('The virtual machine was created successfully.').should('exist');
    cy.byButtonText('Close').click();
    cy.get('#creating-virtual-machine-from-volume-catalog-tile').within(() => {
      cy.contains('Complete').should('exist');
    });
  });
});
