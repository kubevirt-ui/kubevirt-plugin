import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';

const RH_TEMPLATES_NS = 'openshift';

const RHEL9_TEMPLATE_NAME = 'rhel9-server-small';

interface NestedVmTemplateSpec {
  template?: {
    spec?: {
      domain?: {
        cpu?: { cores?: number; dedicatedCpuPlacement?: boolean };
        memory?: { guest?: string };
      };
      evictionStrategy?: string;
    };
  };
}

function templateObjects(tmpl: KubernetesResource): KubernetesResource[] {
  const raw = tmpl['objects'];
  return Array.isArray(raw) ? (raw as KubernetesResource[]) : [];
}

function templateParameters(tmpl: KubernetesResource): KubernetesResource[] {
  const raw = tmpl['parameters'];
  return Array.isArray(raw) ? (raw as KubernetesResource[]) : [];
}

test.describe('Template — user template lifecycle API', { tag: ['@api'] }, () => {
  let templateName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    templateName = utils.generateRandomTemplateName('tmpl-lc');

    const yaml = utils.TemplateFactory.create({
      name: templateName,
      namespace: testNamespace,
      displayName: 'API Test Template',
      cpuCores: 1,
      memory: '512Mi',
      workload: 'server',
    });

    await test.step('CREATE template via console proxy', async () => {
      const created = await apiClient.createTemplate(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('Template');
      expect(created.metadata.name).toBe(templateName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (templateName) {
      await apiClient.deleteTemplate(testNamespace, templateName).catch(() => undefined);
    }
  });

  test('READ: GET single template returns correct spec', async ({ testNamespace, apiClient }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    expect(tmpl.kind).toBe('Template');
    expect(tmpl.metadata.name).toBe(templateName);
    expect(tmpl.metadata.labels?.['template.kubevirt.io/type']).toBe('vm');
  });

  test('READ: template appears in namespace list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getTemplates(testNamespace);
    expect(list.kind).toBe('TemplateList');
    const found = list.items.find((t: KubernetesResource) => t.metadata?.name === templateName);
    expect(found, `template ${templateName} must appear in namespace list`).toBeDefined();
  });

  test('READ: template returned by kubevirt type label filter', async ({
    testNamespace,
    apiClient,
  }) => {
    const list = await apiClient.getTemplates(
      testNamespace,
      'template.kubevirt.io/type in (base,vm)',
    );
    const found = list.items.find((t: KubernetesResource) => t.metadata?.name === templateName);
    expect(found, 'template must appear in vm-type filtered list').toBeDefined();
  });

  test('READ: template has NAME and CLOUD_USER_PASSWORD parameters', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const params: string[] = templateParameters(tmpl).map((p) => String(p['name']));
    expect(params, 'must contain NAME parameter').toContain('NAME');
    expect(params, 'must contain CLOUD_USER_PASSWORD parameter').toContain('CLOUD_USER_PASSWORD');
  });

  test('READ: template objects array contains a VirtualMachine', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    expect(templateObjects(tmpl).length > 0, 'objects must be non-empty').toBe(true);
    const vm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    expect(vm, 'objects must contain a VirtualMachine').toBeDefined();
  });

  test('PATCH: update cpu.cores via JSON Patch', async ({ testNamespace, apiClient }) => {
    await apiClient.patchTemplate(testNamespace, templateName, [
      {
        op: 'replace',
        path: '/objects/0/spec/template/spec/domain/cpu/cores',
        value: 2,
      },
    ]);
    const updated = await apiClient.getTemplate(testNamespace, templateName);
    const vmObj = templateObjects(updated)[0];
    expect((vmObj?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.cpu?.cores).toBe(2);
  });

  test('PATCH: update memory via JSON Patch', async ({ testNamespace, apiClient }) => {
    await apiClient.patchTemplate(testNamespace, templateName, [
      {
        op: 'replace',
        path: '/objects/0/spec/template/spec/domain/memory/guest',
        value: '1Gi',
      },
    ]);
    const updated = await apiClient.getTemplate(testNamespace, templateName);
    const vmObjMem = templateObjects(updated)[0];
    expect((vmObjMem?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.memory?.guest).toBe(
      '1Gi',
    );
  });

  test('PATCH: add custom label to template metadata', async ({ testNamespace, apiClient }) => {
    await apiClient.patchTemplate(testNamespace, templateName, [
      { op: 'add', path: '/metadata/labels/api-test', value: 'template-crud' },
    ]);
    const updated = await apiClient.getTemplate(testNamespace, templateName);
    expect(updated.metadata.labels?.['api-test']).toBe('template-crud');
  });

  test('DELETE: remove template and confirm it leaves the list', async ({
    testNamespace,
    apiClient,
  }) => {
    const result = await apiClient.deleteTemplate(testNamespace, templateName);
    expect(['Template', 'Status']).toContain(result.kind);

    const list = await apiClient.getTemplates(testNamespace);
    const found = list.items.find((t: KubernetesResource) => t.metadata?.name === templateName);
    expect(found, 'template must not appear in list after deletion').toBeUndefined();

    templateName = '';
  });
});

test.describe('Template — dedicated resources API', { tag: ['@api'] }, () => {
  let templateName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    templateName = utils.generateRandomTemplateName('tmpl-ded');

    const yaml = utils.TemplateFactory.create({
      name: templateName,
      namespace: testNamespace,
      displayName: 'Dedicated CPU Template',
      workload: 'highperformance',
      workloadLabel: 'highperformance',
      dedicatedCpuPlacement: true,
      evictionStrategy: 'LiveMigrate',
      cpuCores: 2,
      memory: '1Gi',
    });

    await test.step('CREATE dedicated-resources template', async () => {
      const created = await apiClient.createTemplate(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('Template');
      expect(created.metadata.name).toBe(templateName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (templateName) {
      await apiClient.deleteTemplate(testNamespace, templateName).catch(() => undefined);
    }
  });

  test('READ: template has highperformance workload label', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    expect(tmpl.metadata.labels?.['workload.template.kubevirt.io/highperformance']).toBe('true');
  });

  test('READ: nested VM has dedicatedCpuPlacement=true', async ({ testNamespace, apiClient }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const vm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    expect(
      (vm?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement,
    ).toBe(true);
  });

  test('READ: nested VM has LiveMigrate eviction strategy', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const vm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    expect((vm?.spec as NestedVmTemplateSpec)?.template?.spec?.evictionStrategy).toBe(
      'LiveMigrate',
    );
  });
});

test.describe('Template — clone API', { tag: ['@api'] }, () => {
  let sourceName: string;
  let cloneName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    sourceName = utils.generateRandomTemplateName('tmpl-src');
    cloneName = utils.generateRandomTemplateName('tmpl-clone');

    const yaml = utils.TemplateFactory.create({
      name: sourceName,
      namespace: testNamespace,
      cpuCores: 2,
      memory: '1Gi',
    });

    await test.step('CREATE source template', async () => {
      const created = await apiClient.createTemplate(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('Template');
    });

    await test.step('CLONE: GET source and re-POST under new name', async () => {
      const source = await apiClient.getTemplate(testNamespace, sourceName);
      const clone = {
        ...source,
        metadata: {
          ...source.metadata,
          name: cloneName,
          resourceVersion: undefined,
          uid: undefined,
          creationTimestamp: undefined,
          generation: undefined,
          managedFields: undefined,
        },
      };
      const created = await apiClient.createTemplate(testNamespace, clone);
      expect(created.kind).toBe('Template');
      expect(created.metadata.name).toBe(cloneName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    await Promise.all([
      apiClient.deleteTemplate(testNamespace, sourceName).catch(() => undefined),
      apiClient.deleteTemplate(testNamespace, cloneName).catch(() => undefined),
    ]);
  });

  test('READ: clone exists in namespace list', async ({ testNamespace, apiClient }) => {
    const list = await apiClient.getTemplates(testNamespace);
    const found = list.items.find((t: KubernetesResource) => t.metadata?.name === cloneName);
    expect(found, `cloned template ${cloneName} must appear in namespace list`).toBeDefined();
  });

  test('READ: clone has same CPU and memory spec as source', async ({
    testNamespace,
    apiClient,
  }) => {
    const [source, clone] = await Promise.all([
      apiClient.getTemplate(testNamespace, sourceName),
      apiClient.getTemplate(testNamespace, cloneName),
    ]);
    const srcVm = templateObjects(source).find((o) => o.kind === 'VirtualMachine');
    const cloneVm = templateObjects(clone as KubernetesResource).find(
      (o) => o.kind === 'VirtualMachine',
    );
    expect((cloneVm?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.cpu?.cores).toBe(
      (srcVm?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.cpu?.cores,
    );
    expect((cloneVm?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.memory?.guest).toBe(
      (srcVm?.spec as NestedVmTemplateSpec)?.template?.spec?.domain?.memory?.guest,
    );
  });
});

test.describe('Template — Red Hat templates read-only API', { tag: ['@api'] }, () => {
  test('GET: openshift namespace has VM templates', async ({ apiClient }) => {
    const list = await apiClient.getTemplates(
      RH_TEMPLATES_NS,
      'template.kubevirt.io/type in (base,vm)',
    );
    expect(list.kind).toBe('TemplateList');
    expect(
      list.items.length,
      'Red Hat VM templates must exist in openshift namespace',
    ).toBeGreaterThan(0);
  });

  test('GET: RHEL9 template exists and has expected structure', async ({ apiClient }) => {
    const tmpl = await apiClient.getTemplate(RH_TEMPLATES_NS, RHEL9_TEMPLATE_NAME);
    expect(tmpl.kind).toBe('Template');
    expect(
      templateParameters(tmpl).length > 0,
      'RHEL9 template must have at least one parameter',
    ).toBe(true);
    expect(templateObjects(tmpl).length > 0, 'RHEL9 template must have objects').toBe(true);
    const vm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    expect(vm, 'RHEL9 template objects must include a VirtualMachine').toBeDefined();
  });

  test('GET: RHEL9 template has os and type labels', async ({ apiClient }) => {
    const tmpl = await apiClient.getTemplate(RH_TEMPLATES_NS, RHEL9_TEMPLATE_NAME);
    expect(tmpl.metadata.labels?.['template.kubevirt.io/type']).toMatch(/^(base|vm)$/);
    const hasOsLabel = Object.keys(tmpl.metadata.labels ?? {}).some((k) =>
      k.startsWith('os.template.kubevirt.io/'),
    );
    expect(hasOsLabel, 'RHEL9 template must have an os.template.kubevirt.io/* label').toBe(true);
  });

  test('GET: template list returns all-namespaces results when namespace omitted', async ({
    apiClient,
  }) => {
    const list = await apiClient.getTemplates(undefined, 'template.kubevirt.io/type in (base,vm)');
    expect(list.kind).toBe('TemplateList');
    expect(list.items.length).toBeGreaterThan(0);
    const namespaces = new Set(list.items.map((t: KubernetesResource) => t.metadata?.namespace));
    expect(namespaces.has(RH_TEMPLATES_NS), 'cross-namespace list must include openshift ns').toBe(
      true,
    );
  });
});
