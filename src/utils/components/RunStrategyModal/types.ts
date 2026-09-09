import { type RunStrategy } from '@kubevirt-utils/resources/vm/utils/constants';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type WarningMessage = {
  body?: string;
  title: string;
};

export type RunStrategySelection = '' | RunStrategy;

export type RunStrategyModalProps = {
  hasMixedStrategies?: boolean;
  hasStoppedVMs?: boolean;
  initialRunStrategy?: RunStrategy;
  isOpen: boolean;
  isVMRunning: boolean;
  onClose: () => void;
  onSubmit: (runStrategy: RunStrategy) => Promise<K8sResourceCommon | K8sResourceCommon[] | void>;
  vmCount?: number;
};
