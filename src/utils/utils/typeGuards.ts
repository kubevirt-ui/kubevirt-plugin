import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const isVM = (source: unknown): source is V1VirtualMachine =>
  (source as V1VirtualMachine)?.kind === VirtualMachineModel.kind;
