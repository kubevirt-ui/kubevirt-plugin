/**
 * Helper functions for setting up test data, particularly for advanced search tests.
 * Creates VMs with different characteristics for testing search filters.
 */

import type RequestContextClient from '@/clients/request-context-client';
import { DISK_NAMES } from '@/data-models';
import type { JsonPatchOp, KubernetesResource } from '@/data-models/kubernetes-types';
import { EnvVariables } from '@/utils/env-variables';
import {
  CONSOLE_USER_SETTINGS_NAMESPACE,
  consoleUserSettingsConfigMapName,
  consoleUserSettingsKey,
  kubevirtPreferenceKey,
  type KubevirtPreferenceName,
} from '@/utils/kubevirt-user-preferences';
import {
  generateRandomName,
  generateRandomString,
  generateTestNamespace,
} from '@/utils/random-data-generator';
import { TestTimeouts } from '@/utils/test-config';

export type AdvancedSearchVmNames = {
  defaultVm: string;
  templateVm: string;
  instanceTypeVm: string;
  searchTerm: string;
};

type CreateAdvancedSearchTestVmsOptions = {
  testPrefix?: string;
  startVms?: boolean;
  templateName?: string;
  bootableVolumeName?: string;
  /**
   * When true, default and template VMs are created with 4Gi memory (via template customization)
   * so that memory filter "<= 2Gi" only matches the instance-type VM (U-small, 2Gi).
   * Use for tests that filter by memory (e.g. CNV-11958).
   */
  memorySearch?: boolean;
};

function generateUniqueSuffix(): string {
  return generateRandomString(6, 'alphanumeric').toLowerCase();
}

async function addVmLabel(
  client: RequestContextClient,
  labelKey: string,
  labelValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(namespace, vmName);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = labelKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: JsonPatchOp[] = [];
  if (!vm.metadata?.labels) {
    patchOps.push({ op: 'add', path: '/metadata/labels', value: { [labelKey]: labelValue } });
  } else {
    patchOps.push({ op: 'add', path: `/metadata/labels/${escapedKey}`, value: labelValue });
  }
  await client.patchVirtualMachine(namespace, vmName, patchOps);
}

async function addVmAnnotation(
  client: RequestContextClient,
  annotationKey: string,
  annotationValue: string,
  vmName: string,
  namespace: string,
): Promise<void> {
  const vm = await client.getVirtualMachine(namespace, vmName);
  if (!vm) {
    throw new Error(`VM '${vmName}' not found in namespace '${namespace}'`);
  }
  const escapedKey = annotationKey.replace(/~/g, '~0').replace(/\//g, '~1');
  const patchOps: JsonPatchOp[] = [];
  if (!vm.metadata?.annotations) {
    patchOps.push({
      op: 'add',
      path: '/metadata/annotations',
      value: { [annotationKey]: annotationValue },
    });
  } else {
    patchOps.push({
      op: 'add',
      path: `/metadata/annotations/${escapedKey}`,
      value: annotationValue,
    });
  }
  await client.patchVirtualMachine(namespace, vmName, patchOps);
}

export async function createAdvancedSearchTestVms(
  client: RequestContextClient,
  namespace: string,
  options: CreateAdvancedSearchTestVmsOptions = {},
): Promise<AdvancedSearchVmNames> {
  const {
    testPrefix = 'test',
    startVms = false,
    templateName = 'fedora-server-small',
    bootableVolumeName = 'fedora',
    memorySearch = false,
  } = options;

  const uniquePrefix = `${testPrefix}${generateUniqueSuffix()}`;

  const defaultVmName = generateRandomName(`search-default-${uniquePrefix}`);
  const templateVmName = generateRandomName(`search-template-${uniquePrefix}`);
  const instanceTypeVmName = generateRandomName(`search-it-${uniquePrefix}`);

  await client.createVmFromTemplate(templateName, defaultVmName, namespace, 'openshift', startVms);
  client.trackResource('VirtualMachine', defaultVmName, namespace);

  if (memorySearch) {
    const memPatch: JsonPatchOp[] = [
      { op: 'replace', path: '/spec/template/spec/domain/resources/requests/memory', value: '4Gi' },
    ];
    await client.patchVirtualMachine(namespace, defaultVmName, memPatch);
  }

  await client.createVmFromTemplate(templateName, templateVmName, namespace, 'openshift', startVms);
  client.trackResource('VirtualMachine', templateVmName, namespace);

  if (memorySearch) {
    const memPatch: JsonPatchOp[] = [
      { op: 'replace', path: '/spec/template/spec/domain/resources/requests/memory', value: '4Gi' },
    ];
    await client.patchVirtualMachine(namespace, templateVmName, memPatch);
  }

  await addVmLabel(client, 'template', 'true', templateVmName, namespace);
  await addVmAnnotation(client, 'description', 'Customized', templateVmName, namespace);

  await client.createVmFromInstanceType(
    bootableVolumeName,
    instanceTypeVmName,
    namespace,
    'U series',
    'small',
    startVms,
  );
  client.trackResource('VirtualMachine', instanceTypeVmName, namespace);

  await addVmLabel(client, 'instancetype', 'true', instanceTypeVmName, namespace);
  await addVmAnnotation(client, 'description', 'Customized', instanceTypeVmName, namespace);

  return {
    defaultVm: defaultVmName,
    templateVm: templateVmName,
    instanceTypeVm: instanceTypeVmName,
    searchTerm: uniquePrefix,
  };
}

export async function setupTestNamespace(
  client: RequestContextClient,
  prefix: string,
): Promise<string> {
  const namespace = generateTestNamespace(prefix);
  await client.ensureNamespace(namespace);
  await client.waitForNamespaceReady(namespace, TestTimeouts.NAMESPACE_READY);
  client.trackResource('Namespace', namespace);
  return namespace;
}

type DefaultSSHKeyArgs = {
  client: RequestContextClient;
  namespace: string;
};

type SetupDefaultSSHKeyArgs = DefaultSSHKeyArgs & {
  secretName: string;
};

/**
 * Identifier of the current user in the console user-settings ConfigMap
 * (`user-settings-<key>`, SDK user preferences): `kubeadmin`, else the user uid / sanitized name.
 */
export async function resolveUserSettingsKey(client: RequestContextClient): Promise<string> {
  const user = await client.getResource('user.openshift.io', 'v1', 'users', '~');
  const key =
    consoleUserSettingsKey(user ?? undefined) ??
    (EnvVariables.isNonPrivUser ? EnvVariables.testUsername : undefined);

  if (!key) {
    throw new Error('Could not resolve console user-settings key for the current user');
  }
  return key;
}

/** Reads a KubeVirt plugin SDK user preference (`kubevirt.<name>`) of the current user. */
export async function getKubevirtUserPreference<T = unknown>(
  client: RequestContextClient,
  name: KubevirtPreferenceName,
  cluster?: string,
): Promise<T | undefined> {
  const settingsKey = await resolveUserSettingsKey(client);
  const userSettingsCm = await client.getKubeVirtUserSettings(settingsKey);
  const raw = (userSettingsCm?.data as Record<string, string> | undefined)?.[
    kubevirtPreferenceKey(name, cluster)
  ];
  return raw === undefined ? undefined : (JSON.parse(raw) as T);
}

/** Writes a KubeVirt plugin SDK user preference (`kubevirt.<name>`) of the current user. */
export async function setKubevirtUserPreference(
  client: RequestContextClient,
  name: KubevirtPreferenceName,
  value: unknown,
  cluster?: string,
): Promise<void> {
  const settingsKey = await resolveUserSettingsKey(client);
  await client.mergePatchResource(
    '',
    'v1',
    'configmaps',
    consoleUserSettingsConfigMapName(settingsKey),
    { data: { [kubevirtPreferenceKey(name, cluster)]: JSON.stringify(value) } },
    CONSOLE_USER_SETTINGS_NAMESPACE,
  );
}

async function patchDefaultSshForNamespace({
  client,
  namespace,
  secretName,
}: DefaultSSHKeyArgs & { secretName: string | null }): Promise<void> {
  const ssh = { ...(await getKubevirtUserPreference<Record<string, string>>(client, 'ssh')) };
  if (secretName) {
    ssh[namespace] = secretName;
  } else {
    delete ssh[namespace];
  }

  await setKubevirtUserPreference(client, 'ssh', ssh);
}

/**
 * Creates an SSH public-key Secret and records it as the user's default key
 * for the given namespace in the `kubevirt.ssh` user preference.
 */
export async function setupDefaultSSHKey({
  client,
  namespace,
  secretName,
}: SetupDefaultSSHKeyArgs): Promise<void> {
  await client.createSSHKeySecret(namespace, secretName);
  client.trackResource('Secret', secretName, namespace);
  await patchDefaultSshForNamespace({ client, namespace, secretName });
}

/**
 * Removes the default SSH key mapping for a namespace from the `kubevirt.ssh` user preference.
 * Used when the test namespace is reused (HC E2E) so leftover defaults do not leak.
 */
export async function clearDefaultSSHKey({ client, namespace }: DefaultSSHKeyArgs): Promise<void> {
  await patchDefaultSshForNamespace({ client, namespace, secretName: null });
}

export const getVmAccessCredentials = (vm: KubernetesResource | null): unknown[] | undefined => {
  const spec = vm?.spec as {
    template?: { spec?: { accessCredentials?: unknown[] } };
  };
  return spec?.template?.spec?.accessCredentials;
};

export type ProjectNetworkSettingsAnnotations = {
  /** Value for kubevirt.io/default-network (NAD name in the project). */
  defaultNetwork?: string;
  /**
   * When false, sets kubevirt.io/allow-pod-network to "false".
   * When true/undefined, the annotation is omitted (pod networking allowed by default).
   */
  allowPodNetwork?: boolean;
};

/** Creates a bridge NetworkAttachmentDefinition for project-network UI tests. */
export async function createBridgeNetworkAttachmentDefinition(
  client: RequestContextClient,
  name: string,
  namespace: string,
  bridge = 'br1',
): Promise<void> {
  await client.createResourceByKind(
    'NetworkAttachmentDefinition',
    {
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
    },
    namespace,
  );
  client.trackResource('NetworkAttachmentDefinition', name, namespace);
}

/**
 * Creates a VM with a KubeVirt emptyDisk and no bootable volume.
 * Skipping DataSource clones / container image pulls makes the VM much more
 * likely to reach Running in CI.
 */
export async function createVmWithEmptyDisk(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  startVm = true,
): Promise<void> {
  await client.createVirtualMachine(namespace, {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: { name: vmName, namespace },
    spec: {
      runStrategy: startVm ? 'Always' : 'Halted',
      template: {
        spec: {
          domain: {
            cpu: { cores: 1 },
            devices: {
              disks: [{ bootOrder: 1, disk: { bus: 'virtio' }, name: DISK_NAMES.EMPTY }],
              interfaces: [{ masquerade: {}, name: 'default' }],
            },
            memory: { guest: '1Gi' },
          },
          networks: [{ name: 'default', pod: {} }],
          terminationGracePeriodSeconds: 0,
          volumes: [{ emptyDisk: { capacity: '1Gi' }, name: DISK_NAMES.EMPTY }],
        },
      },
    },
  });
  client.trackResource('VirtualMachine', vmName, namespace);
  const exists = await client.waitForVmExists(vmName, namespace);
  if (!exists) {
    throw new Error(`Empty-disk VM ${vmName} was not created in namespace ${namespace}`);
  }
}

/**
 * Appends a bridge Multus NIC to a VirtualMachine spec.
 * Safe to call on a running VM (hot-plug add); the UI then lists the interface for NAD edit.
 */
export async function attachBridgeNetworkInterface(
  client: RequestContextClient,
  vmName: string,
  namespace: string,
  nicName: string,
  nadName: string,
): Promise<void> {
  await client.patchVirtualMachine(namespace, vmName, [
    {
      op: 'add',
      path: '/spec/template/spec/domain/devices/interfaces/-',
      value: {
        bridge: {},
        model: 'virtio',
        name: nicName,
      },
    },
    {
      op: 'add',
      path: '/spec/template/spec/networks/-',
      value: {
        multus: { networkName: nadName },
        name: nicName,
      },
    },
  ]);
}

export function getVmMultusNetworkName(
  vm: KubernetesResource | null,
  nicName: string,
): string | undefined {
  const spec = vm?.spec as
    | {
        template?: {
          spec?: {
            networks?: Array<{ name?: string; multus?: { networkName?: string } }>;
          };
        };
      }
    | undefined;

  return spec?.template?.spec?.networks?.find((network) => network.name === nicName)?.multus
    ?.networkName;
}

/**
 * Sets project-level KubeVirt network annotations on a Namespace.
 * Always writes both annotation keys; omitted/undefined values are cleared via
 * JSON merge-patch nulls so configs can be replaced cleanly.
 */
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
