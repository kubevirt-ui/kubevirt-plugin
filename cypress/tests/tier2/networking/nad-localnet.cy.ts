import { NIC, VirtualMachineData } from '../../../types/vm';
import { adminOnlyDescribe, MINUTE, TEST_NS } from '../../../utils/const/index';
import { NAD_LOCALNET } from '../../../utils/const/nad';
import { TEMPLATE } from '../../../utils/const/template';
import { createNAD, deleteNAD } from '../../../views/nad';
import { vm } from '../../../views/vm-flow';

const nic: NIC = {
  model: 'virtio',
  name: 'nic-localnet',
  network: NAD_LOCALNET.name,
};

const testVM: VirtualMachineData = {
  ethName: 'eth1',
  gateway: '192.168.1.255',
  ipAddr: '192.168.1.15',
  name: 'vm-with-localnet-nic',
  namespace: TEST_NS,
  nics: [nic],
  template: TEMPLATE.CENTOSSTREAM9,
};

adminOnlyDescribe('Test secondary localnet NAD', () => {
  before(() => {
    cy.deleteVMs([testVM]);
    cy.beforeSpec();
    cy.visitNAD();
    cy.switchProject(TEST_NS);
  });

  after(() => {
    cy.deleteVMs([testVM]);
  });

  it('ID(CNV-) create NAD with secondary localnet network', () => {
    createNAD(NAD_LOCALNET);
  });

  // takes very log time, flaky
  xit('ID(CNV-) create VM with secondary localnet NAD', () => {
    vm.customizeCreate(testVM);
    cy.wait(MINUTE);
  });

  xit(
    'ID(CNV-) verify vm is up with the correct ip address',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.contains('.VirtualMachinesOverviewTabInterfaces--main', testVM.ipAddr).should('exist');
    },
  );

  it('ID(CNV-4288) delete NAD', () => {
    cy.visitNAD();
    deleteNAD(NAD_LOCALNET.name);
  });
});
