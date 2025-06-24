import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOptionProps } from '@patternfly/react-core';

export type EnhancedSelectOptionProps = SelectOptionProps & {
  group?: string;
  groupVersionKind?: K8sGroupVersionKind;
  label?: string;
  value: string;
  /** Value for the text filter. Takes precedence over value, useful when value does not reflect the text content of the option. */
  valueForFilter?: string;
};
