import { FC } from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Labels = Record<string, string>;

export type GroupedOptions = {
  label: string;
  options: string[];
}[];

export type SelectOptionItem = { id: string; isDisabled?: boolean; value: string };

export type ClassifyResult = { system: Labels; user: Labels };

export type KeyValueEntries = { [id: number]: { key: string; value: string } };

export type KeyRendererProps = {
  existingKeys: string[];
  onSelect: (key: string) => void;
  selectedKey: string;
};

export type KeyValueModalProps = {
  classifyEntries?: (data: Labels) => ClassifyResult;
  headerText?: string;
  initialData?: Labels;
  isOpen: boolean;
  KeyRenderer?: FC<KeyRendererProps>;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (data: Labels) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
  submitBtnText?: string;
  validateEntry?: (key: string, value: string) => string | undefined;
};
