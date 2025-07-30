import { VM_ISO, VM_W2K19 } from '../../../utils/const/testVM';
import { winDrivers } from '../../../views/selector-catalog';
import { vmOSOnOverview } from '../../../views/selector-common';
import { tab } from '../../../views/tab';
import { vm } from '../../../views/vm-flow';

xdescribe('Create Windows VMs', () => {
  before(() => {
    cy.deleteVMs([VM_W2K19, VM_ISO]);
    cy.beforeSpec();
  });

  after(() => {
    cy.deleteVMs([VM_W2K19, VM_ISO]);
  });

  it('ID(CNV-8927) create windows VM', () => {
    vm.create(VM_W2K19, false); // uncheck windows driver VM
    tab.navigateToConfigurationStorage();
    cy.get(winDrivers).should('not.be.checked');
  });

  // regression for bz: [Bug 2156246] Windows 11 is detected as Windows 10
  xit(
    'ID(CNV-8927) check windows OS',
    {
      retries: {
        openMode: 0,
        runMode: 5,
      },
    },
    () => {
      cy.contains(vmOSOnOverview, 'Windows Server').should('exist');
      cy.dump();
      cy.deleteVMs([VM_W2K19]);
    },
  );

  // https://issues.redhat.com/browse/CNV-39975
  it('ID(CNV-8925) create windows VM from ISO', () => {
    vm.customizeCreate(VM_ISO, false);
    cy.get(winDrivers).should('be.checked');
    cy.exec(
      `oc patch vm ${VM_ISO.name}  --type=merge --patch '{"spec": {"template": {"spec": {"terminationGracePeriodSeconds": 60}}}}'`,
    );
  });
});
