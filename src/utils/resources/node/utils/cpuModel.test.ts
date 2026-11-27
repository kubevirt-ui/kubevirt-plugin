import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

import { getNodesMissingCPUModel } from './cpuModel';

const node = (name: string, models: string[]): IoK8sApiCoreV1Node => ({
  metadata: {
    labels: Object.fromEntries(
      models.map((model) => [`cpu-model.node.kubevirt.io/${model}`, 'true']),
    ),
    name,
  },
});

describe('getNodesMissingCPUModel', () => {
  const nodes = [node('worker-a', ['Skylake-Server', 'Penryn']), node('worker-b', ['Penryn'])];

  it('lists nodes missing a model', () => {
    expect(getNodesMissingCPUModel(nodes, 'Skylake-Server')).toEqual(['worker-b']);
    expect(getNodesMissingCPUModel(nodes, 'Penryn')).toEqual([]);
  });

  it('treats unknown models as missing on every node', () => {
    expect(getNodesMissingCPUModel(nodes, 'Cascadelake-Server')).toEqual(['worker-a', 'worker-b']);
  });
});
