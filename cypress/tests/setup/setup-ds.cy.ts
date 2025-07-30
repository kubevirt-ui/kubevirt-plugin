import { adminOnlyIT, nonPrivIT, TEST_NS } from '../../utils/const/index';
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
    cy.task('log', `    ARTIFACTORY_PATH: [${Cypress.env('ARTIFACTORY_PATH')}]`);
    cy.task('log', `    ARTIFACTORY_SERVER: [${Cypress.env('ARTIFACTORY_SERVER')}]`);
    cy.task('log', `    ARTIFACTORY_TOKEN: [${Cypress.env('ARTIFACTORY_TOKEN')}]`);
    cy.task('log', `    ARTIFACTORY_USER: [${Cypress.env('ARTIFACTORY_USER')}]`);
    cy.task('log', `    BRIDGE_KUBEADMIN_PASSWORD: [${Cypress.env('BRIDGE_KUBEADMIN_PASSWORD')}]`);
    cy.task('log', `    CIRROS_IMAGE: [${Cypress.env('CIRROS_IMAGE')}]`);
    cy.task('log', `    CNV_NS: [${Cypress.env('CNV_NS')}]`);
    cy.task('log', `    CNV_QE_SERVER: [${Cypress.env('CNV_QE_SERVER')}]`);
    cy.task('log', `    DOWNSTREAM: [${Cypress.env('DOWNSTREAM')}]`);
    cy.task('log', `    GPU: [${Cypress.env('GPU')}]`);
    cy.task('log', `    LOCAL_IMAGE: [${Cypress.env('LOCAL_IMAGE')}]`);
    cy.task('log', `    MTC: [${Cypress.env('MTC')}]`);
    cy.task('log', `    NNCP_NIC: [${Cypress.env('NNCP_NIC')}]`);
    cy.task('log', `    NON_PRIV: [${Cypress.env('NON_PRIV')}]`);
    cy.task('log', `    OS_IMAGES_NS: [${Cypress.env('OS_IMAGES_NS')}]`);
    cy.task('log', `    SNO: [${Cypress.env('SNO')}]`);
    cy.task('log', `    SRIOV: [${Cypress.env('SRIOV')}]`);
    cy.task('log', `    STORAGE_CLASS: [${Cypress.env('STORAGE_CLASS')}]`);
    cy.task('log', `    FIRST_NODE: [${Cypress.env('FIRST_NODE')}]`);
    cy.task('log', `    SECOND_NODE: [${Cypress.env('SECOND_NODE')}]`);
    cy.task('log', `    THIRD_NODE: [${Cypress.env('THIRD_NODE')}]`);
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
