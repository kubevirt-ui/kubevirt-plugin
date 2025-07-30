import {
  ALL_PROJ_NS,
  DATASOURCE_NAME,
  K8S_KIND,
  TEST_NS,
  YAML_DS_NAME,
} from '../../../utils/const/index';
import * as str from '../../../utils/const/string';
import * as sel from '../../../views/selector-common';

describe('Test Virtualization Bootable volumes page', () => {
  before(() => {
    cy.beforeSpec();
    cy.deleteResource(K8S_KIND.DS, YAML_DS_NAME, TEST_NS);
    cy.deleteResource(K8S_KIND.DS, DATASOURCE_NAME, TEST_NS);
  });

  after(() => {
    cy.deleteResource(K8S_KIND.DS, YAML_DS_NAME, TEST_NS);
    cy.deleteResource(K8S_KIND.DS, DATASOURCE_NAME, TEST_NS);
  });

  it('ID(CNV-9372) Create DataSource with YAML', () => {
    cy.visitVolumesVirt();
    cy.switchProject(TEST_NS);
    cy.wait(5000);
    cy.get(sel.itemCreateBtn).click();
    cy.byButtonText(str.withYAML).click();
    cy.get(sel.createBtn).click();
    cy.wait(3000);
  });
});
