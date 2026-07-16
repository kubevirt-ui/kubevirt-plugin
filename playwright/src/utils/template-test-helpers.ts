import type RequestContextClient from '@/clients/request-context-client';
import type { TemplateConfig } from '@/data-factories/template-factory';
import type { TestUtilsType } from '@/fixtures/test-utils';
import { TestTimeouts } from '@/utils/test-config';

export async function setupTemplateFromResource(
  client: RequestContextClient,
  prefix: string,
  config: Omit<Partial<TemplateConfig>, 'namespace'> & { targetNamespace: string; name?: string },
  utils: TestUtilsType,
): Promise<{ templateName: string; templateDisplayName: string }> {
  const { targetNamespace, name: explicitName, ...templateFields } = config;
  const templateName = explicitName ?? utils.generateRandomTemplateName(prefix);
  const templateDisplayName =
    templateFields.displayName ?? `${prefix} ${utils.generateRandomString(8, 'alphanumeric')}`;
  const templateResource = utils.TemplateFactory.createResourceObject({
    ...templateFields,
    name: templateName,
    namespace: targetNamespace,
    displayName: templateDisplayName,
  });
  await client.createTemplate(targetNamespace, templateResource);
  client.trackResource('Template', templateName, targetNamespace);
  return { templateName, templateDisplayName };
}

export async function verifyTemplateDeletedFromCluster(
  client: RequestContextClient,
  templateName: string,
  namespace: string,
  utils: TestUtilsType,
  timeoutMs: number = utils.TestTimeouts.DEFAULT,
): Promise<{ deleted: boolean; error?: string }> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      await client.getTemplate(namespace, templateName);
    } catch {
      return { deleted: true };
    }
    await new Promise((resolve) => setTimeout(resolve, utils.TestTimeouts.POLLING_INTERVAL));
  }
  return {
    deleted: false,
    error: `Template ${templateName} still exists after ${timeoutMs}ms`,
  };
}

export function buildTemplateDetailResource(
  templateName: string,
  namespace: string,
): Record<string, unknown> {
  return {
    apiVersion: 'template.openshift.io/v1',
    kind: 'Template',
    metadata: {
      labels: {
        'os.template.kubevirt.io/fedora': 'true',
        'template.kubevirt.io/type': 'base',
        'workload.template.kubevirt.io/server': 'true',
      },
      name: templateName,
      namespace,
    },
    objects: [
      {
        apiVersion: 'kubevirt.io/v1',
        kind: 'VirtualMachine',
        metadata: { labels: { app: '${NAME}' }, name: '${NAME}' },
        spec: {
          runStrategy: 'Always',
          template: {
            metadata: { labels: { 'kubevirt.io/domain': '${NAME}' } },
            spec: {
              domain: {
                devices: {
                  disks: [{ disk: { bus: 'virtio' }, name: 'containerdisk' }],
                  interfaces: [{ masquerade: {}, model: 'virtio', name: 'default' }],
                  rng: {},
                },
                resources: { requests: { memory: '1Gi' } },
              },
              networks: [{ name: 'default', pod: {} }],
              terminationGracePeriodSeconds: 180,
              volumes: [
                {
                  containerDisk: { image: 'quay.io/containerdisks/fedora:latest' },
                  name: 'containerdisk',
                },
              ],
            },
          },
        },
      },
    ],
    parameters: [
      {
        description: 'VM name',
        from: 'vm-[a-z0-9]{6}',
        generate: 'expression',
        name: 'NAME',
      },
      {
        description: 'Cloud user password',
        from: '[a-z0-9]{4}-[a-z0-9]{4}',
        generate: 'expression',
        name: 'CLOUD_USER_PASSWORD',
      },
    ],
  };
}
