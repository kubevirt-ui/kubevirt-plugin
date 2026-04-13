import {
  DEFAULT_VM_NAME,
  RHEL_GUEST_IMAGE,
  TEST_NS,
  TEST_SECRET_NAME,
} from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { mastheadLogo } from '../../views/selector';
import { useExisting } from '../../views/selector-catalog';
import { selectSecret } from '../../views/selector-instance';

const SSH_SECTION = 'settings-user-ssh-key';

function clearStaleSSHSettings() {
  cy.exec(
    `oc get configmap kubevirt-user-settings -n openshift-cnv -o json 2>/dev/null | ` +
      `python3 -c "` +
      `import json,sys; ` +
      `cm=json.load(sys.stdin); ` +
      `[cm['data'].__setitem__(k, json.dumps({**json.loads(v), 'ssh': {}})) ` +
      `for k,v in cm['data'].items() if 'ssh' in json.loads(v)]; ` +
      `print(json.dumps(cm))" | oc apply -f - 2>/dev/null`,
    { failOnNonZeroExit: false },
  ).then((result) => {
    if (result.code !== 0) {
      cy.log(`clearStaleSSHSettings failed (code ${result.code}): ${result.stderr}`);
    }
  });
}

function isSSHKeyConfiguredForTestNS($section: JQuery): boolean {
  const text = $section.text();
  return text.includes(TEST_NS) && text.includes(TEST_SECRET_NAME);
}

function configureSSHSecret() {
  cy.byLegacyTestID('select-project-toggle').click();
  cy.get(`[data-test-id="select-option-${TEST_NS}"] button`).click();
  cy.get('button.project-ssh-row__secret-name').click();
  cy.get(useExisting).click();
  cy.get(selectSecret).click();
  cy.byButtonText(TEST_SECRET_NAME).click();
  cy.clickSaveBtn();
}

describe('Cluster Test Preparation', () => {
  before(() => {
    cy.login();
    cy.get(mastheadLogo).scrollIntoView();
    cy.switchToVirt();
    cy.switchProject(TEST_NS);
  });

  it('configure public ssh key', () => {
    clearStaleSSHSettings();
    cy.visitSettingsVirt();
    cy.byButtonText('User').click();
    cy.url().then((currentUrl) => {
      const baseUrl = currentUrl.split('#')[0];
      cy.visit(`${baseUrl}#ssh-keys`);
    });

    cy.contains(authSSHKey, { timeout: 30000 }).should('be.visible');
    cy.byLegacyTestID(SSH_SECTION).should('be.visible');

    cy.byLegacyTestID(SSH_SECTION).then(($section) => {
      if (isSSHKeyConfiguredForTestNS($section)) {
        cy.task('log', `SSH secret already configured for ${TEST_NS}`);
      } else {
        configureSSHSecret();
      }
    });

    cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME).should('exist');
  });

  it('create example VM', () => {
    cy.exec(`oc delete vm ${DEFAULT_VM_NAME} -n ${TEST_NS} --ignore-not-found`, {
      failOnNonZeroExit: false,
    });
    cy.exec(
      `cat <<'EOF' | oc apply -n ${TEST_NS} -f -
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: ${DEFAULT_VM_NAME}
  labels:
    app: ${DEFAULT_VM_NAME}
spec:
  runStrategy: Halted
  template:
    metadata:
      labels:
        kubevirt.io/domain: ${DEFAULT_VM_NAME}
    spec:
      domain:
        cpu:
          cores: 1
          sockets: 1
          threads: 1
        devices:
          disks:
            - disk:
                bus: virtio
              name: rootdisk
            - disk:
                bus: virtio
              name: cloudinitdisk
          interfaces:
            - masquerade: {}
              model: virtio
              name: default
          networkInterfaceMultiqueue: true
          rng: {}
        memory:
          guest: 2Gi
      hostname: ${DEFAULT_VM_NAME}
      networks:
        - name: default
          pod: {}
      terminationGracePeriodSeconds: 180
      volumes:
        - containerDisk:
            image: ${RHEL_GUEST_IMAGE}
          name: rootdisk
        - cloudInitNoCloud:
            userData: |
              #cloud-config
              user: rhel10
              password: test-password
              chpasswd: { expire: false }
          name: cloudinitdisk
EOF`,
    );
  });
});
