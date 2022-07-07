import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockResolvedValue({}),
}));

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
