import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';

import { getResourceUrl } from '../resources/shared';

test('getResourceUrl', () => {
  const resource = {
    metadata: {
      namespace: 'kube',
      name: 'vm',
    },
  };

  const url = getResourceUrl(VirtualMachineModel, resource);
  expect(url).toBe('/k8s/ns/kube/kubevirt.io~v1~VirtualMachine/vm');

  const nullUrl = getResourceUrl(VirtualMachineModel, null);
  expect(nullUrl).toBe(null);
});
