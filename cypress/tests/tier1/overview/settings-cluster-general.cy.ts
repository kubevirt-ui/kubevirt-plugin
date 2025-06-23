import { OS_IMAGES_NS, SECOND } from '../../../utils/const/index';
import { tab } from '../../../views/tab';

describe('Test Cluster General settings', () => {
  before(() => {
    cy.beforeSpec();
    tab.navigateToOverview();
    tab.navigateToSettings();
  });

  describe('Test Automatic images download', () => {
    it('disable centos-stream-9-image-cron', () => {
      cy.contains('Templates and images management').click();
      cy.contains('Automatic images download').click();
      cy.get('#centos-stream9-image-cron-auto-image-download-switch')
        .find('input.pf-v6-c-switch__input')
        .uncheck({ force: true });
      cy.wait(10 * SECOND);
    });

    it('delete centos-stream9 volumesnapshot', () => {
      const cmd = `oc delete datavolume -n ${OS_IMAGES_NS} -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron`;
      cy.exec(cmd);
      cy.wait(10 * SECOND);
    });

    it('enable centos-stream9-image-cron again', () => {
      cy.get('#centos-stream9-image-cron-auto-image-download-switch')
        .find('input.pf-v6-c-switch__input')
        .check({ force: true });
      cy.wait(60 * SECOND);
    });

    it(
      'verify volume is downloaded again',
      {
        retries: {
          runMode: 10,
        },
      },
      () => {
        cy.wait(15 * SECOND);
        const cmd = `oc get datavolume -n ${OS_IMAGES_NS} -l cdi.kubevirt.io/dataImportCron=centos-stream9-image-cron | grep centos-stream9`;
        cy.exec(cmd);
      },
    );
  });
});
