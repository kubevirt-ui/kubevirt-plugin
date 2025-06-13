import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';

export const isVM = (source: unknown): source is V1VirtualMachine =>
  (source as V1VirtualMachine)?.kind === VirtualMachineModel.kind;

export const isNetworkInterfaceState = (obj: unknown): obj is NetworkInterfaceState =>
  typeof obj === 'string' && Object.values(NetworkInterfaceState).some((value) => value === obj);
