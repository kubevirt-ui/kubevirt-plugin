import secretFixture from '../../fixtures/secret';
import { TEST_NS } from '../../utils/const/index';
import { brandImage } from '../../views/selector';

const WELCOME_OFF_CMD = `oc patch configmap -n kubevirt-hyperconverged kubevirt-user-settings --type=merge --patch '{"data": {"kube-admin": "{\\"quickStart\\":{\\"dontShowWelcomeModal\\":true}}"}}'`;

describe('Prepare the cluster for test', () => {
  before(() => {
    cy.login();
    cy.exec('oc whoami').then((result) => {
      cy.task('log', `Running as: [${result.stdout}]`);
    });
  });

  it('create test secret', () => {
    cy.exec(`echo '${JSON.stringify(secretFixture)}' | oc create -f -`);
  });

  it('close the welcome modal', () => {
    cy.exec(WELCOME_OFF_CMD).then((result) => {
      cy.task('log', `WELCOME_OFF_CMD: [${result.stdout}]`);
    });
  });

  it('switch to Virtualization perspective and default project', () => {
    cy.task('log', `  Switch to Virtualization perspective`);
    cy.get(brandImage).scrollIntoView();
    cy.switchToVirt();

    // needed because of https://issues.redhat.com/browse/CNV-51570
    cy.switchProject(TEST_NS);
  });
});
