import { SECOND } from '../../../utils/const/index';
import { VM_ISO, VM_W2K19 } from '../../../utils/const/testVM';
import { vmOSOnOverview, winDriverDisk } from '../../../views/selector-common';
import { vm } from '../../../views/vm-flow';

describe('Create Windows VMs', () => {
  before(() => {
    cy.visit('');
    cy.deleteVMs([VM_W2K19, VM_ISO]);
  });

  it('ID(CNV-8927) create windows VM', () => {
    vm.create(VM_W2K19); // uncheck windows driver VM
    // cy.get(winDriverDisk).should('not.exist');
    cy.wait(120 * SECOND);
  });

  // regression for bz: [Bug 2156246] Windows 11 is detected as Windows 10
  it(
    'ID(CNV-8927) check windows OS',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.contains(vmOSOnOverview, 'Windows Server 2012').should('exist');
      cy.dump();
      cy.deleteVMs([VM_W2K19]);
    },
  );

  // https://issues.redhat.com/browse/CNV-39975
  xit('ID(CNV-8925) create windows VM from ISO', () => {
    vm.customizeCreate(VM_ISO, false);
    cy.get(winDriverDisk).should('exist');
    cy.exec(
      `oc patch vm ${VM_ISO.name}  --type=merge --patch '{"spec": {"template": {"spec": {"terminationGracePeriodSeconds": 60}}}}'`,
    );
  });
});
