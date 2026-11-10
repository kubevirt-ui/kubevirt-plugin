import type RequestContextClient from '@/clients/request-context-client';
import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import { EnvVariables } from '@/utils/env-variables';
import yaml from 'js-yaml';

type UserSshSettings = { ssh?: Record<string, string> };

export type ProjectNetworkSettingsAnnotations = {
  defaultNetwork?: string;
  allowPodNetwork?: boolean;
};

async function patchDefaultSshForNamespace({
  client,
  cnvNamespace = EnvVariables.cnvNamespace,
  namespace,
  secretName,
}: {
  client: RequestContextClient;
  cnvNamespace?: string;
  namespace: string;
  secretName: string | null;
}): Promise<void> {
  const userSettingsCm = await client.getConfigMap('kubevirt-user-settings', cnvNamespace);
  if (!userSettingsCm?.data) {
    throw new Error(`kubevirt-user-settings ConfigMap not found in ${cnvNamespace}`);
  }
  const settingsKey =
    Object.keys(userSettingsCm.data).find((k) => k !== 'featureGates') ?? 'kube-admin';
  const cmData = userSettingsCm.data;
  const parsed = JSON.parse(cmData[settingsKey] || '{}') as UserSshSettings;
  const ssh = { ...parsed.ssh };
  if (secretName) {
    ssh[namespace] = secretName;
  } else {
    delete ssh[namespace];
  }
  parsed.ssh = ssh;

  const op: JsonPatchOp = cmData[settingsKey]
    ? { op: 'replace', path: `/data/${settingsKey}`, value: JSON.stringify(parsed) }
    : { op: 'add', path: `/data/${settingsKey}`, value: JSON.stringify(parsed) };

  await client.patchConfigMap('kubevirt-user-settings', cnvNamespace, [op]);
}

export async function setupDefaultSSHKey({
  client,
  cnvNamespace = EnvVariables.cnvNamespace,
  namespace,
  secretName,
}: {
  client: RequestContextClient;
  cnvNamespace?: string;
  namespace: string;
  secretName: string;
}): Promise<void> {
  await client.createSSHKeySecret(namespace, secretName);
  client.trackResource('Secret', secretName, namespace);
  await patchDefaultSshForNamespace({ client, cnvNamespace, namespace, secretName });
}

export async function clearDefaultSSHKey({
  client,
  cnvNamespace = EnvVariables.cnvNamespace,
  namespace,
}: {
  client: RequestContextClient;
  cnvNamespace?: string;
  namespace: string;
}): Promise<void> {
  await patchDefaultSshForNamespace({ client, cnvNamespace, namespace, secretName: null });
}

export const getVmAccessCredentials = (vm: KubernetesResource | null): unknown[] | undefined => {
  const spec = vm?.spec as {
    template?: { spec?: { accessCredentials?: unknown[] } };
  };
  return spec?.template?.spec?.accessCredentials;
};

export async function createBridgeNetworkAttachmentDefinition(
  client: RequestContextClient,
  name: string,
  namespace: string,
  bridge = 'br1',
): Promise<void> {
  await client.applyYaml(
    yaml.dump({
      apiVersion: 'k8s.cni.cncf.io/v1',
      kind: 'NetworkAttachmentDefinition',
      metadata: { name, namespace },
      spec: {
        config: JSON.stringify({
          cniVersion: '0.3.1',
          name,
          type: 'bridge',
          bridge,
        }),
      },
    }),
  );
  client.trackResource('NetworkAttachmentDefinition', name, namespace);
}

export async function setProjectNetworkSettings(
  client: RequestContextClient,
  namespace: string,
  settings: ProjectNetworkSettingsAnnotations = {},
): Promise<void> {
  const annotations: Record<string, string | null> = {
    'kubevirt.io/default-network': settings.defaultNetwork ?? null,
    'kubevirt.io/allow-pod-network': settings.allowPodNetwork === false ? 'false' : null,
  };

  await client.mergePatchResource('', 'v1', 'namespaces', namespace, {
    metadata: { annotations },
  });
}
