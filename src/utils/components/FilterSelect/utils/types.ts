import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOptionProps } from '@patternfly/react-core';

export type EnhancedSelectOptionProps = SelectOptionProps & {
  groupVersionKind?: K8sGroupVersionKind;
};
