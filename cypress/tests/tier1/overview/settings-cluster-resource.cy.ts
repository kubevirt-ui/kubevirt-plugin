import { adminOnlyDescribe, TEST_NS } from '../../../utils/const/index';
import { previewFeaturesTxt } from '../../../views/selector-instance';
import { tab } from '../../../views/tab';

adminOnlyDescribe('Test Cluster Resource management', () => {
  before(() => {
    cy.beforeSpec();
    cy.visitOverviewVirt();
  });

  describe('Test KSM', () => {
    it('ID(CNV-10726) enable KSM feature', () => {
      tab.navigateToSettings();
      cy.contains('Resource management').click();
      cy.get('input[id="kernel-samepage-merging"]').check({ force: true });
      cy.wait(5000);
    });

    it('ID(CNV-10726) verify KSM in HCO', () => {
      const spec = '.spec.ksmConfiguration';
      const matchString = `{"nodeLabelSelector":{}}`;
      cy.checkHCOSpec(spec, matchString, true);
    });
  });

  // CNV-37265 - CPU limits project selector modal matches all projects when no labels are entered
  // CNV-37266 - Can't save the CPU limits project selector modal with no labels entered
  // adminOnlyDescribe('Test Resource limits', () => {
  xdescribe('Test Auto-compute CPU limits', () => {
    const customLabel = 'auto-test.limit.cpu.kubevirt.io';
    const projectName = 'kubernetes.io/metadata.name';
    const getLabelsCmd = `oc get hyperconverged -n openshift-cnv kubevirt-hyperconverged -o jsonpath='{.spec.resourceRequirements.autoCPULimitNamespaceLabelSelector.matchLabels}'`;
    const projSelTitle = 'Project selector';
    const AutoCompBtn = 'Auto-compute CPU limits';

    before(() => {
      cy.visit('');
      cy.exec(`oc label --overwrite namespace ${TEST_NS} ${customLabel}=true`)
        .its('stdout')
        .should('contain', 'labeled');
      cy.exec(`oc label --overwrite namespace openshift-cnv ${customLabel}=true`)
        .its('stdout')
        .should('contain', 'labeled');
    });

    it('ID(CNV-10731) check adding CPU limits', () => {
      cy.visitOverviewVirt();
      tab.navigateToSettings();
      cy.byButtonText(previewFeaturesTxt).click();
      cy.get('#autocomputeCPULimitsPreviewEnabled label').click();
      cy.wait(1000);
      cy.get('#autocomputeCPULimitsPreviewEnabled label')
        .find(':checkbox')
        .should('have.attr', 'aria-labelledby')
        .and('include', '-on');

      cy.byButtonText('Cluster').click();
      cy.byButtonText('Resource management').click();
      cy.contains('.expand-section-with-switch', AutoCompBtn).within(() => {
        cy.contains('.pf-c-label__content', 'New').should('be.visible');
        cy.get('label').click();
      });
      cy.wait(1000);
      cy.contains('.expand-section-with-switch', AutoCompBtn)
        .find(':checkbox')
        .should('have.attr', 'aria-labelledby')
        .and('include', '-on');
      cy.contains('.expand-section-with-switch', AutoCompBtn).click();
      // cy.exec(getLabelsCmd)
      //   .its('stdout')
      //   .should('be.empty');
      cy.contains(projSelTitle).within(() => {
        cy.get('button').click();
      });
      cy.get('.project-selector-modal').within(() => {
        cy.checkTitle(projSelTitle);
        cy.get('#vm-labels-list-add-btn').click();
        cy.get('#label-0-key-input').clear().type(projectName);
        cy.get('#label-0-value-input').clear().type(TEST_NS);
        cy.contains('.pf-c-alert__title', '1 Project');
        cy.clickSaveBtn();
      });
      cy.exec(getLabelsCmd).its('stdout').should('contain', `{"${projectName}":"${TEST_NS}"}`);
      cy.contains(projSelTitle).within(() => {
        cy.get('button').click();
      });
      cy.get('.project-selector-modal').within(() => {
        cy.checkTitle(projSelTitle);
        cy.get('#vm-labels-list-add-btn').click();
        cy.get('#label-0-key-input').clear().type(customLabel);
        cy.get('#label-0-value-input').clear().type('true');
        cy.contains('.pf-c-alert__title', '2 Projects');
        cy.clickSaveBtn();
      });
      cy.exec(getLabelsCmd)
        .its('stdout')
        .should('contain', `{"${projectName}":"${TEST_NS}"}`)
        .and('contain', `{"${customLabel}":"true"}`);
      cy.exec(`oc label --overwrite namespace openshift-cnv ${customLabel}=false`)
        .its('stdout')
        .and('contain', 'labeled');
      cy.contains(projSelTitle).within(() => {
        cy.get('button').click();
      });
      cy.get('.project-selector-modal').within(() => {
        cy.checkTitle(projSelTitle);
        cy.contains('.pf-c-alert__title', '1 Project');
        cy.clickCancelBtn();
      });
    });
  });
});
