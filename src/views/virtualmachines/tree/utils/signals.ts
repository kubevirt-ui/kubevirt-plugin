import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { signal } from '@preact/signals-react';
import type { VMIMMapper } from '@virtualmachines/utils/mappers';

export type FleetVMInventoryMeta = {
  error?: Error;
  loaded: boolean;
  refresh?: () => void;
};

export const vmsSignal = signal<V1VirtualMachine[]>([]);

export const vmsInventoryMetaSignal = signal<FleetVMInventoryMeta>({ loaded: false });

export const vmimMapperSignal = signal<VMIMMapper>({});
