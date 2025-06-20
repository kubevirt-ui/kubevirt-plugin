import { TEST_NS } from '../../utils/const/index';
import { NAD_BRIDGE, NAD_LOCALNET, NAD_OVN } from '../../utils/const/nad';
import { createNAD, deleteNAD } from '../../views/nad';

describe('Test network attachments', () => {
  beforeEach(() => {
    cy.beforeSpec();
    cy.visitNAD();
    cy.switchProject(TEST_NS);
  });

  it('create NAD with MAC Spoof checked', () => {
    createNAD(NAD_BRIDGE);
  });

  it('create NAD with OVN Kubernetes localnet network', () => {
    createNAD(NAD_LOCALNET);
  });

  it('create NAD with OVN overlay network', () => {
    createNAD(NAD_OVN);
  });

  it('delete NAD', () => {
    cy.visitNAD();
    deleteNAD(NAD_BRIDGE.name);
    deleteNAD(NAD_LOCALNET.name);
  });
});
