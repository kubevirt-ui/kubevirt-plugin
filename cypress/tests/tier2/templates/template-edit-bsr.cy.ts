import { VirtualMachineData } from '../../../types/vm';
import { DiskSource } from '../../../utils/const/diskSource';
import * as ind from '../../../utils/const/index';
import { TEMPLATE } from '../../../utils/const/template';
import { action } from '../../../views/actions';
import { diskSource } from '../../../views/selector-catalog';
import * as tView from '../../../views/selector-template';
import { getRow } from '../../../views/template-flow';
import { vm } from '../../../views/vm-flow';

const sourceTemplate = TEMPLATE.WIN2K12R2;
const vmFromTemplate: VirtualMachineData = {
  diskSource: DiskSource.Default,
  name: 'vm-from-edited-bsr',
  namespace: ind.TEST_NS,
  startOnCreation: true,
  template: sourceTemplate,
};

describe('Test template boot source reference', () => {
  before(() => {
    cy.deleteVMs([vmFromTemplate]);
    cy.deleteResource(ind.K8S_KIND.PVC, sourceTemplate.dvName, ind.OS_IMAGES_NS);
    cy.visitVMs();
    cy.visitTemplates();
  });

  after(() => {
    cy.deleteVMs([vmFromTemplate]);
    cy.deleteResource(ind.K8S_KIND.PVC, sourceTemplate.dvName, ind.OS_IMAGES_NS);
  });

  it('ID(CNV-9116) Edit the boot source reference of Windows template', () => {
    cy.switchProject(ind.ALL_PROJ_NS);
    cy.get(tView.itemFilter).type(sourceTemplate.metadataName);
    cy.wait(ind.SECOND);
    action.EditTemplateBSR(sourceTemplate.metadataName);
    cy.byButtonText('Select boot source').click();
    cy.get(diskSource.PVC).click();
    cy.contains(tView.selectProjectStr).click();
    cy.byButtonText(ind.TEST_NS).click();
    cy.get(tView.selectPVC).click();
    cy.wait(3 * ind.SECOND);
    cy.byButtonText(ind.TEST_PVC_NAME).click();
    cy.clickSaveBtn();
  });

  it('ID(CNV-9116) Clone in progress badge is showing for the template', () => {
    cy.wait(6 * ind.SECOND);
    getRow(sourceTemplate.metadataName, () => cy.contains('Clone in progress').should('exist'));
  });

  it(
    'ID(CNV-9116) Source available badge is showing for the template',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.wait(ind.MINUTE);
      if (Cypress.env('STORAGE_CLASS') !== 'ocs-storagecluster-ceph-rbd') {
        getRow(sourceTemplate.metadataName, () =>
          cy.contains('Clone in progress').should('not.exist'),
        );
      }
      getRow(sourceTemplate.metadataName, () => cy.contains('Source available').should('exist'));
    },
  );

  it('ID(CNV-9117) Create VM from the edited Windows template', () => {
    cy.visitCatalog();
    cy.switchProject(ind.TEST_NS);
    vm.create(vmFromTemplate);
  });
});
