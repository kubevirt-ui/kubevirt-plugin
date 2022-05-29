import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { getServicesForVmi } from '../services';

import {
  serviceWithMatchingSelectors,
  serviceWithoutMatchingSelectors,
  serviceWithoutSelectors,
  serviceWithUndefinedSelectors,
  vmiMock,
} from './mocks';

describe('Test getServicesForVmi', () => {
  it('No services', () => {
    const services: IoK8sApiCoreV1Service[] = [];
    const vmi: V1VirtualMachineInstance = vmiMock;

    const result = getServicesForVmi(services, vmi);

    expect(result).toEqual([]);
  });

  it('Services with undefined selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithUndefinedSelectors];
    const vmi: V1VirtualMachineInstance = vmiMock;

    const result = getServicesForVmi(services, vmi);

    expect(result).toEqual([]);
  });

  it('Services without selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithoutSelectors];
    const vmi: V1VirtualMachineInstance = vmiMock;

    const result = getServicesForVmi(services, vmi);

    expect(result).toEqual([]);
  });

  it('No services with matching selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithoutMatchingSelectors];
    const vmi: V1VirtualMachineInstance = vmiMock;

    const result = getServicesForVmi(services, vmi);

    expect(result).toEqual([]);
  });

  it('Services with matching selectors', () => {
    const services: IoK8sApiCoreV1Service[] = [serviceWithMatchingSelectors];
    const vmi: V1VirtualMachineInstance = vmiMock;

    const result = getServicesForVmi(services, vmi);

    expect(result).toEqual([serviceWithMatchingSelectors]);
  });
});
