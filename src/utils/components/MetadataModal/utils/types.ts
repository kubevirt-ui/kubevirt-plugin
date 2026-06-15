import { ReactNode } from 'react';

import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { Labels } from './utils';

export type ClassifyResult = { system: Labels; user: Labels };

export type KeyValueEntries = { [id: number]: { key: string; value: string } };

export type KeyValueModalProps = {
  classifyEntries?: (data: Labels) => ClassifyResult;
  headerText?: string;
  initialData?: Labels;
  isOpen: boolean;
  isSystemKey?: (key: string) => boolean;
  keyRenderer?: (props: {
    existingKeys: string[];
    onSelect: (key: string) => void;
    selectedKey: string;
  }) => ReactNode;
  obj: K8sResourceCommon;
  onClose: () => void;
  onSubmit: (data: Labels) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
  submitBtnText?: string;
  validateEntry?: (key: string, value: string) => string | undefined;
};
