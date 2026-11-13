import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { applyCPUMemoryToVM } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

import { buildVirtualMachineResourcePatches } from './vmDataUtils';

const makeVM = (domain: Record<string, unknown>): V1VirtualMachine =>
  ({ spec: { template: { spec: { domain: { devices: {}, ...domain } } } } } as V1VirtualMachine);

describe('CPU and memory patches', () => {
  it('patches CPU but skips memory when its value is unchanged', () => {
    const originalVM = makeVM({
      cpu: { cores: 4 },
      resources: { requests: { memory: '16Gi' } },
    });
    const cpu = { cores: 6 };
    const updatedVM = applyCPUMemoryToVM(originalVM, cpu, 16, BinaryUnit.Gi);

    expect(updatedVM.spec.template.spec.domain.memory).toBeUndefined();
    expect(buildVirtualMachineResourcePatches(originalVM, updatedVM)).toEqual([
      {
        op: 'replace',
        path: '/spec/template/spec/domain/cpu',
        value: { cores: 6 },
      },
    ]);
  });

  it('patches request-based memory and skips CPU when its value is unchanged', () => {
    const originalVM = makeVM({
      cpu: { cores: 4 },
      resources: { requests: { memory: '16Gi' } },
    });
    const updatedVM = applyCPUMemoryToVM(originalVM, { cores: 4 }, 20, BinaryUnit.Gi);

    expect(buildVirtualMachineResourcePatches(originalVM, updatedVM)).toEqual([
      {
        op: 'replace',
        path: '/spec/template/spec/domain/resources/requests/memory',
        value: '20Gi',
      },
    ]);
  });

  it('updates guest memory when the VM defines it', () => {
    const originalVM = makeVM({
      cpu: { cores: 2, sockets: 1, threads: 1 },
      memory: { guest: '16Gi' },
    });
    const updatedVM = applyCPUMemoryToVM(
      originalVM,
      { cores: 6, sockets: 1, threads: 1 },
      20,
      BinaryUnit.Gi,
    );

    expect(buildVirtualMachineResourcePatches(originalVM, updatedVM)).toEqual([
      {
        op: 'replace',
        path: '/spec/template/spec/domain/cpu',
        value: { cores: 6, sockets: 1, threads: 1 },
      },
      {
        op: 'replace',
        path: '/spec/template/spec/domain/memory/guest',
        value: '20Gi',
      },
    ]);
  });

  it('adds CPU when it does not exist', () => {
    const originalVM = makeVM({ memory: { guest: '4Gi' } });
    const updatedVM = applyCPUMemoryToVM(
      originalVM,
      { cores: 2, sockets: 1, threads: 1 },
      4,
      BinaryUnit.Gi,
    );

    expect(buildVirtualMachineResourcePatches(originalVM, updatedVM)).toEqual([
      {
        op: 'add',
        path: '/spec/template/spec/domain/cpu',
        value: { cores: 2, sockets: 1, threads: 1 },
      },
    ]);
  });
});
