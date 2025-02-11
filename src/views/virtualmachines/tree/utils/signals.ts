import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { signal } from '@preact/signals-react';
import { VmimMapper } from '@virtualmachines/utils/mappers';

export const vmsSignal = signal<V1VirtualMachine[]>([]);

export const vmimMapperSignal = signal<VmimMapper>({});
