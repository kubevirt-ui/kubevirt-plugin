/**
 * Create the test secret from a YAML fixture, substituting name/namespace.
 * Replaces the `yq | oc apply` bash block.
 *
 * Env: TEST_SECRET_NAME, TEST_NS, TEST_ENGINE
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import * as yaml from 'js-yaml';

import { KubeClient, requireEnv } from '../kube-client';

const main = async (): Promise<void> => {
  const secretName = requireEnv('TEST_SECRET_NAME');
  const testNs = requireEnv('TEST_NS');
  const testEngine = process.env.TEST_ENGINE ?? 'playwright';

  const fixturePath = resolve(testEngine, 'fixtures', 'secret.yaml');
  const content = yaml.load(readFileSync(fixturePath, 'utf8')) as Record<string, unknown>;

  const metadata = content.metadata as Record<string, unknown>;
  metadata.name = secretName;
  metadata.namespace = testNs;

  const client = KubeClient.fromKubeconfig();

  try {
    await client.coreV1.createNamespacedSecret({
      namespace: testNs,
      body: content as Parameters<typeof client.coreV1.createNamespacedSecret>[0]['body'],
    });
    console.log(`Created secret ${secretName} in ${testNs}`);
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 409) {
      console.log(`Secret ${secretName} already exists in ${testNs}`);
    } else {
      throw err;
    }
  }
};

main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
