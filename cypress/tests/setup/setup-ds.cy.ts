import { adminOnlyIT, envVars, nonPrivIT, TEST_NS } from '../../utils/const/index';
import { welcomeCheckbox } from '../../views/selector-overview';

const tickWelcomeModal = () => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('Do not show this again')) {
      cy.get(welcomeCheckbox).check();
    }
  });
};

describe('Configure the cluster for test', () => {
  xit('log CYPRESS environmental vars', () => {
    envVars.forEach((envVar) => cy.task('log', `    ${envVar}: [${Cypress.env(envVar)}]`));
  });

  adminOnlyIT('ID(CNV-10325) close the welcome modal - CLI', () => {
    const WELCOME_OFF_CMD = `oc patch configmap -n openshift-cnv kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\\"quickStart\\":{\\"dontShowWelcomeModal\\":true}}"}}'`;
    cy.exec(WELCOME_OFF_CMD);
  });

  adminOnlyIT('set ui preview features - CLI', () => {
    const UI_FEAT_CMD = `oc patch configmap -n openshift-cnv kubevirt-ui-features --type=merge --patch '{"data": {"advancedSearch": "true", "treeViewFolders": "true", "loadBalancerEnabled": "false", "nodePortEnabled": "false"}}'`;
    cy.exec(UI_FEAT_CMD);
  });

  nonPrivIT('ID(CNV-10325) close the welcome modal - UI', () => {
    cy.wait(10000);
    tickWelcomeModal();
    cy.contains('Do not show this again').should('not.exist');
  });

  // ensure the welcome modal is closed on overview page
  nonPrivIT(
    'ID(CNV-10325) ensure the welcome modal is closed - UI',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.visitAdminPerspectiveVols();
      cy.wait(3000);
      cy.visitAdminPerspectiveOverview();
      cy.wait(5000);
      tickWelcomeModal();
    },
  );

  it('switch to Virtualization perspective and default project', () => {
    cy.task('log', `      Switch to Virtualization perspective`);
    cy.switchToVirt();

    // needed because of https://issues.redhat.com/browse/CNV-51570
    cy.switchProject(TEST_NS);
  });
});
