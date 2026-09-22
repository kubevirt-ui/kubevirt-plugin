import { type ValidatedOptions } from '@patternfly/react-core';

export type SysprepFile = {
  fileName: string;
  isLoading: boolean;
  validated: ValidatedOptions;
  value: string;
};

export enum SysprepSelectionOption {
  CreateNew = 'createNew',
  None = 'none',
  UseExisting = 'useExisting',
}

export type SysprepModalProps = {
  cluster?: string;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onSysprepCreation: (unattended: string, autoUnattend: string) => Promise<void> | void;
  onSysprepSelected: (sysprepName: string) => Promise<void> | void;
  sysprepSelected?: string;
};
