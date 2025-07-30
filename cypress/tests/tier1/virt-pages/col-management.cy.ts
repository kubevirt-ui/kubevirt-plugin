import { adminOnlyDescribe, ALL_PROJ_NS } from '../../../utils/const/index';
import * as vmView from '../../../views/selector-common';

adminOnlyDescribe('Test dynamic columns management', () => {
  before(() => {
    cy.beforeSpec();
  });

  it(
    'visit vm list page',
    {
      retries: {
        runMode: 8,
      },
    },
    () => {
      cy.visitVMsVirt();
    },
  );

  it('ID(CNV-9329) Test dynamic columns management on VM and Template list page', () => {
    cy.get(vmView.colManage).click();
    cy.byButtonText(vmView.resetBtnTxt).click();
    cy.clickSaveBtn();
    cy.get(vmView.statusTH).should('exist');
    cy.get(vmView.nodeTH).should('exist');
    cy.get(vmView.createdTH).should('not.exist');

    cy.get(vmView.colManage).click();
    cy.get(vmView.statusCol).uncheck();
    cy.get(vmView.nodeCol).uncheck();
    cy.get(vmView.createdCol).check();
    cy.clickSaveBtn();
    cy.get(vmView.statusTH).should('not.exist');
    cy.get(vmView.nodeTH).should('not.exist');
    cy.get(vmView.createdTH).should('exist');
    cy.get(vmView.colManage).click();
    cy.byButtonText(vmView.resetBtnTxt).click();
    cy.clickSaveBtn();

    cy.visitTemplates();
    cy.switchProject(ALL_PROJ_NS);

    cy.get(vmView.colManage).click();
    cy.byButtonText(vmView.resetBtnTxt).click();
    cy.clickSaveBtn();
    cy.get(vmView.nsTH).should('exist');
    cy.get(vmView.workloadTH).should('exist');
    cy.get(vmView.bootsourceTH).should('exist');
    cy.get(vmView.cpuTH).should('not.exist');

    cy.get(vmView.colManage).click();
    cy.get(vmView.nsCol).uncheck();
    cy.get(vmView.workloadCol).uncheck();
    cy.get(vmView.bootsourceCol).uncheck();
    cy.get(vmView.cpuCol).check();
    cy.clickSaveBtn();
    cy.get(vmView.nsTH).should('not.exist');
    cy.get(vmView.workloadTH).should('not.exist');
    cy.get(vmView.bootsourceTH).should('not.exist');
    cy.get(vmView.cpuTH).should('exist');
    cy.get(vmView.colManage).click();
    cy.byButtonText(vmView.resetBtnTxt).click();
    cy.clickSaveBtn();
  });
});
