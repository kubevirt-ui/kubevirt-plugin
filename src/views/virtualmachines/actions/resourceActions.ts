// Extracted from VirtualMachineActionFactory.tsx
// Root: src/views/virtualmachines/actions/VirtualMachineActionFactory.tsx

import { type TFunction } from 'i18next';

import { type CloneDeleteActions, createCloneDeleteActions } from './vmCloneDeleteActions';
import {
  createMetadataConsoleActions,
  type MetadataConsoleActions,
} from './vmMetadataConsoleActions';

export type ResourceActions = CloneDeleteActions & MetadataConsoleActions;

export const createResourceActions = (t: TFunction): ResourceActions => ({
  ...createCloneDeleteActions(t),
  ...createMetadataConsoleActions(t),
});
