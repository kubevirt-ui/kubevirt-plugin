import { load as yamlLoad } from 'js-yaml';

import type { KubernetesResource } from '@/data-models/kubernetes-types';
import { expect, test } from '@/fixtures/api-test-fixture';
import { buildTemplateFromVm } from '@/utils/api-builders';

interface ProxyVmSpec {
  template?: {
    spec?: {
      domain?: {
        cpu?: { cores?: number };
        memory?: { guest?: string };
        devices?: { disks?: KubernetesResource[] };
      };
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

test.describe('VM save-as-template — spec parity API', { tag: ['@api'] }, () => {
  let vmName: string;
  let templateName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('sat-vm-sp');
    templateName = utils.generateRandomTemplateName('sat-tpl-sp');

    await test.step('CREATE source VM (Halted, 2 cores, 1Gi)', async () => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 2,
        memory: '1Gi',
      });
      const created = await apiClient.createVirtualMachine(
        testNamespace,
        yamlLoad(yaml) as KubernetesResource,
      );
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM exists in cluster', async () => {
      const ready = await apiClient.waitForVmExists(vmName, testNamespace);
      expect(ready, 'source VM must exist before building template').toBe(true);
    });

    await test.step('GET VM spec + BUILD template + POST template', async () => {
      const vm = await apiClient.getVirtualMachine(testNamespace, vmName);
      const tmpl = buildTemplateFromVm(vm, templateName, `Saved from ${vmName}`);
      const created = await apiClient.createTemplate(testNamespace, tmpl);
      expect(created.kind).toBe('Template');
      expect(created.metadata.name).toBe(templateName);
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (templateName) {
      await apiClient.deleteTemplate(testNamespace, templateName).catch(() => undefined);
    }
    if (vmName) {
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.waitForVmDeleted(vmName, testNamespace).catch(() => undefined);
    }
  });

  test('READ: template exists and wraps a VirtualMachine object', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    expect(tmpl.kind).toBe('Template');
    const vm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    expect(vm, 'template objects must contain a VirtualMachine').toBeDefined();
  });

  test('READ: template CPU cores match source VM', async ({ testNamespace, apiClient }) => {
    const [sourceVm, tmpl] = await Promise.all([
      apiClient.getVirtualMachine(testNamespace, vmName),
      apiClient.getTemplate(testNamespace, templateName),
    ]);
    const sourceCores = (sourceVm.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.cpu
      ?.cores;
    const tmplVm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    const tmplCores = (tmplVm?.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.cpu?.cores;
    expect(tmplCores).toBe(sourceCores);
  });

  test('READ: template memory matches source VM', async ({ testNamespace, apiClient }) => {
    const [sourceVm, tmpl] = await Promise.all([
      apiClient.getVirtualMachine(testNamespace, vmName),
      apiClient.getTemplate(testNamespace, templateName),
    ]);
    const sourceMemory = (sourceVm.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.memory
      ?.guest;
    const tmplVm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    const tmplMemory = (tmplVm?.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.memory
      ?.guest;
    expect(tmplMemory).toBe(sourceMemory);
  });

  test('READ: template disk list matches source VM volumes', async ({
    testNamespace,
    apiClient,
  }) => {
    const [sourceVm, tmpl] = await Promise.all([
      apiClient.getVirtualMachine(testNamespace, vmName),
      apiClient.getTemplate(testNamespace, templateName),
    ]);
    const sourceDisks: string[] = (
      (sourceVm.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.devices?.disks ?? []
    ).map((d: KubernetesResource) => String(d['name']));

    const tmplVm = templateObjects(tmpl).find((o) => o.kind === 'VirtualMachine');
    const tmplDisks: string[] = (
      (tmplVm?.spec as ProxyVmSpec | undefined)?.template?.spec?.domain?.devices?.disks ?? []
    ).map((d: KubernetesResource) => String(d['name']));

    expect(tmplDisks.sort(), 'template disks must exactly match source VM disks').toEqual(
      sourceDisks.sort(),
    );
  });

  test('READ: template has NAME parameter', async ({ testNamespace, apiClient }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const paramNames = templateParameters(tmpl).map((p) => String(p['name']));
    expect(paramNames).toContain('NAME');
  });

  test('DELETE: remove saved template and confirm it leaves the list', async ({
    testNamespace,
    apiClient,
  }) => {
    const result = await apiClient.deleteTemplate(testNamespace, templateName);
    expect(['Template', 'Status']).toContain(result.kind);

    const list = await apiClient.getTemplates(testNamespace);
    const found = list.items.find((t: KubernetesResource) => t.metadata?.name === templateName);
    expect(found, 'saved template must not appear after deletion').toBeUndefined();
    templateName = '';
  });
});

test.describe('VM save-as-template — label propagation API', { tag: ['@api'] }, () => {
  let vmName: string;
  let templateName: string;

  test.beforeAll(async ({ testNamespace, apiClient, utils }) => {
    vmName = utils.generateRandomVmName('sat-vm-lb');
    templateName = utils.generateRandomTemplateName('sat-tpl-lb');

    await test.step('CREATE source VM with OS and workload labels', async () => {
      const yaml = utils.VirtualMachineFactory.create({
        name: vmName,
        namespace: testNamespace,
        runStrategy: 'Halted',
        cpuCores: 1,
        memory: '512Mi',
      });
      const vmPayload = yamlLoad(yaml) as KubernetesResource;
      vmPayload.metadata = {
        ...(vmPayload.metadata ?? {}),
        labels: {
          ...(vmPayload.metadata?.labels ?? {}),
          'vm.kubevirt.io/os': 'fedora',
          'vm.kubevirt.io/workload': 'server',
        },
      };
      const created = await apiClient.createVirtualMachine(testNamespace, vmPayload);
      expect(created.kind).toBe('VirtualMachine');
    });

    await test.step('WAIT: VM exists', async () => {
      await apiClient.waitForVmExists(vmName, testNamespace);
    });

    await test.step('GET VM + build template + POST', async () => {
      const vm = await apiClient.getVirtualMachine(testNamespace, vmName);
      const tmpl = buildTemplateFromVm(vm, templateName, `Label test from ${vmName}`);
      const osLabel = vm.metadata.labels?.['vm.kubevirt.io/os'];
      const workloadLabel = vm.metadata.labels?.['vm.kubevirt.io/workload'];
      if (osLabel) tmpl.metadata.labels[`os.template.kubevirt.io/${osLabel}`] = 'true';
      if (workloadLabel)
        tmpl.metadata.labels[`workload.template.kubevirt.io/${workloadLabel}`] = 'true';

      const created = await apiClient.createTemplate(testNamespace, tmpl);
      expect(created.kind).toBe('Template');
    });
  });

  test.afterAll(async ({ testNamespace, apiClient }) => {
    if (templateName) {
      await apiClient.deleteTemplate(testNamespace, templateName).catch(() => undefined);
    }
    if (vmName) {
      await apiClient.deleteVirtualMachine(testNamespace, vmName).catch(() => undefined);
      await apiClient.waitForVmDeleted(vmName, testNamespace).catch(() => undefined);
    }
  });

  test('READ: saved template has os.template.kubevirt.io/* label', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const hasOsLabel = Object.keys(tmpl.metadata.labels ?? {}).some((k) =>
      k.startsWith('os.template.kubevirt.io/'),
    );
    expect(hasOsLabel, 'saved template must have an os.template.kubevirt.io/* label').toBe(true);
  });

  test('READ: saved template has workload.template.kubevirt.io/* label', async ({
    testNamespace,
    apiClient,
  }) => {
    const tmpl = await apiClient.getTemplate(testNamespace, templateName);
    const hasWorkloadLabel = Object.keys(tmpl.metadata.labels ?? {}).some((k) =>
      k.startsWith('workload.template.kubevirt.io/'),
    );
    expect(
      hasWorkloadLabel,
      'saved template must have a workload.template.kubevirt.io/* label',
    ).toBe(true);
  });
});
