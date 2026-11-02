import { clusterKubernetesJson } from '@/utils/cluster-kubernetes-api';

const CONSOLE_CLI_DOWNLOAD_READER_ROLE = 'kubevirt-e2e-consoleclidownload-reader';
const CONSOLE_CLI_DOWNLOAD_READER_BINDING = 'kubevirt-e2e-consoleclidownload-reader-binding';

async function createClusterResource(
  apiPath: string,
  body: Record<string, unknown>,
  kubeconfigPath?: string,
): Promise<void> {
  const response = await clusterKubernetesJson('POST', apiPath, body, undefined, kubeconfigPath);
  if (!response.ok && response.status !== 409) {
    throw new Error(
      `Create ${apiPath} failed (${response.status}): ${response.text.slice(0, 500)}`,
    );
  }
}

/** Lets non-priv users resolve `CONSOLE_CLI_DOWNLOAD` (console.flag/model on ConsoleCLIDownload). */
export async function ensureConsoleCliDownloadReaderRbac(
  options: { kubeconfigPath?: string } = {},
): Promise<void> {
  const kubeconfigPath = options.kubeconfigPath;
  const role = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRole',
    metadata: { name: CONSOLE_CLI_DOWNLOAD_READER_ROLE },
    rules: [
      {
        apiGroups: ['console.openshift.io'],
        resources: ['consoleclidownloads'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };
  const binding = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'ClusterRoleBinding',
    metadata: { name: CONSOLE_CLI_DOWNLOAD_READER_BINDING },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'ClusterRole',
      name: CONSOLE_CLI_DOWNLOAD_READER_ROLE,
    },
    subjects: [
      {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Group',
        name: 'system:authenticated',
      },
    ],
  };
  await createClusterResource(
    '/apis/rbac.authorization.k8s.io/v1/clusterroles',
    role,
    kubeconfigPath,
  );
  await createClusterResource(
    '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
    binding,
    kubeconfigPath,
  );
}
