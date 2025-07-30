export const createBtn = '[data-test="item-create"]';
export const fromForm = '[data-test="list-page-create-dropdown-item-form"]';
export const nodeSelectBtn = '#apply-nncp-selector';
export const addLabel = '#vm-labels-list-add-btn';
export const fillKey = (row: string) => `#label-${row}-key-input`;
export const fillValue = (row: string) => `#label-${row}-value-input`;
export const policyName = '#policy-name';
export const policyDesc = '#policy-description';
export const iName = '#policy-interface-name-0';
export const iPort = '#policy-interface-port-0';
export const IPV4 = '#policy-interface-ip-0';
export const STP = '#policy-interface-stp-0';
export const autoDNS = '#policy-interface-dns-0';
export const autoRoutes = '#policy-interface-routes-0';
export const autoGateway = '#policy-interface-gateway-0';
export const fixedIP = '#ip-0';
export const IPV4Addr = '#ipv4-address-0';
export const DHCP = '#dhcp-0';
export const submitBtn = 'button[form="create-policy-form"]';
export const href = 'a[href="/k8s/ns/cluster/nmstate.io~v1~NodeNetworkConfigurationPolicy"]';

export const createNNCP = (name: string, port: string) => {
  cy.get(createBtn).click();
  cy.get(fromForm).click();
  cy.get(nodeSelectBtn).click();
  cy.get(addLabel).click();
  cy.get(fillKey('0')).type('cpumanager'); // hardcode it here
  cy.get(fillValue('0')).type('true');
  cy.clickSubmitBtn();
  cy.get(policyName).clear();
  cy.get(policyName).type(name);
  cy.get(policyDesc).type('create nncp');
  cy.get('option[value="linux-bridge"]').should('exist');
  cy.get(IPV4).check();
  cy.get(DHCP).click();
  cy.get(iPort).clear().type(port);
  cy.get(submitBtn).click();
};
