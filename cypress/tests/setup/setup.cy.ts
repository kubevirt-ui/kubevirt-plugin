import {
  DEFAULT_VM_NAME,
  RHEL_GUEST_IMAGE,
  TEST_NS,
  TEST_SECRET_NAME,
} from '../../utils/const/index';
import { authSSHKey } from '../../utils/const/string';
import { mastheadLogo } from '../../views/selector';

/**
 * Configure the public SSH key via ConfigMap instead of the Settings UI.
 * The project dropdown runs checkAccess for every namespace and is flaky on
 * large CI clusters (option never appears / menu remounts while access
 * reviews are in flight). Setup only needs the mapping to exist.
 *
 * User-settings keys are either the user UID or a sanitized username
 * (e.g. kube:admin → kube-admin). We update every existing entry and ensure
 * the current console user key exists.
 */
function configureSSHSecretViaOc() {
  const scriptPath = '/tmp/kubevirt-configure-ssh-settings.py';
  const script = `
import json, re, subprocess, sys

ns = ${JSON.stringify(TEST_NS)}
secret = ${JSON.stringify(TEST_SECRET_NAME)}
ssh = {ns: secret}

try:
    user = json.loads(
        subprocess.check_output(["oc", "get", "user", "~", "-o", "json"], text=True)
    )
except Exception:
    user = {}

meta = user.get("metadata") or {}
user_key = meta.get("uid") or re.sub(r"[^-._a-zA-Z0-9]+", "-", meta.get("name") or "")

cm = json.loads(
    subprocess.check_output(
        [
            "oc",
            "get",
            "configmap",
            "kubevirt-user-settings",
            "-n",
            "openshift-cnv",
            "-o",
            "json",
        ],
        text=True,
    )
)
data = cm.setdefault("data", {})
keys = set(data)
if user_key:
    keys.add(user_key)

for key in keys:
    try:
        settings = json.loads(data.get(key) or "{}")
    except Exception:
        settings = {}
    settings["ssh"] = ssh
    data[key] = json.dumps(settings)

subprocess.run(
    ["oc", "apply", "-f", "-"],
    input=json.dumps(cm),
    text=True,
    check=True,
)
print(f"configured ssh for keys={sorted(keys)} -> {ssh}", file=sys.stderr)
`;

  cy.writeFile(scriptPath, script);
  cy.exec(`python3 ${scriptPath}`);
}

describe('Cluster Test Preparation', () => {
  before(() => {
    cy.login();
    cy.get(mastheadLogo).scrollIntoView();
    cy.switchToVirt();
    cy.switchProject(TEST_NS);
  });

  it('configure public ssh key', () => {
    cy.exec(`oc get secret ${TEST_SECRET_NAME} -n ${TEST_NS}`, { failOnNonZeroExit: false }).then(
      (result) => {
        if (result.code !== 0) {
          cy.exec(
            `oc create secret generic ${TEST_SECRET_NAME} -n ${TEST_NS} ` +
              `--from-file=key=./fixtures/rsa.pub`,
          );
        }
      },
    );

    configureSSHSecretViaOc();

    // Visit Settings to verify the mapping is reflected in the UI.
    cy.visit('/k8s/all-namespaces/virtualization-settings/user');
    cy.url().then((currentUrl) => {
      const baseUrl = currentUrl.split('#')[0];
      cy.visit(`${baseUrl}#ssh-keys`);
    });

    cy.contains(authSSHKey, { timeout: 60000 }).should('be.visible');
    cy.contains('button.project-ssh-row__secret-name', TEST_SECRET_NAME, {
      timeout: 60000,
    }).should('exist');
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
