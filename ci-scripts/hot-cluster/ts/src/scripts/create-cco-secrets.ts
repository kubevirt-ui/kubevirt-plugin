/**
 * Create IBM Cloud credential secrets for CCO manual mode.
 * Replaces: ci-scripts/hot-cluster/create-ibmcloud-cco-secrets.sh
 *
 * Required env: IC_API_KEY, INSTALL_DIR
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import * as yaml from 'js-yaml';

import { requireEnv } from '../kube-client';

const NAMESPACES = [
  'openshift-cloud-controller-manager',
  'openshift-machine-api',
  'openshift-image-registry',
  'openshift-ingress-operator',
  'openshift-cluster-csi-drivers',
];

const SECRET_NAMES = [
  'ibm-cloud-credentials',
  'ibmcloud-credentials',
  'installer-cloud-credentials',
  'cloud-credentials',
];

const main = (): void => {
  const apiKey = requireEnv('IC_API_KEY');
  const installDir = requireEnv('INSTALL_DIR');
  const manifestsDir = join(installDir, 'openshift');

  mkdirSync(manifestsDir, { recursive: true });

  const credEnv = Buffer.from(`IBMCLOUD_AUTHTYPE=iam\nIBMCLOUD_APIKEY=${apiKey}`).toString('base64');
  const rawKey = Buffer.from(apiKey).toString('base64');

  for (const ns of NAMESPACES) {
    for (const secretName of SECRET_NAMES) {
      const filename = `99-${secretName}-${ns}.yaml`;
      const manifest = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: secretName, namespace: ns },
        type: 'Opaque',
        data: {
          ibmcloud_api_key: rawKey,
          'ibm-credentials.env': credEnv,
        },
      };

      const yamlStr = yaml.dump(manifest);
      writeFileSync(join(manifestsDir, filename), yamlStr);
      console.log(`Created ${filename}`);
    }
  }

  console.log(`All IBM Cloud credential secrets generated in ${manifestsDir}/`);
};

main();
