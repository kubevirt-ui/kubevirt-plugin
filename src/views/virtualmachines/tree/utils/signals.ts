import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { signal } from '@preact/signals-react';
import { VMIMMapper } from '@virtualmachines/utils/mappers';

export const vmsSignal = signal<V1VirtualMachine[]>([]);

export const vmimMapperSignal = signal<VMIMMapper>({});
