import React, { FC } from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { SelectOption } from '@patternfly/react-core';

type FilterSelectOptionProps = {
  optionLabel: string;
  optionName: string;
  groupVersionKind: K8sGroupVersionKind;
};

const FilterSelectOption: FC<FilterSelectOptionProps> = ({
  optionLabel,
  optionName,
  groupVersionKind,
}) => (
  <SelectOption
    key={optionName}
    value={optionName}
    data-test-id={`${optionLabel}-select-option-${optionName}`}
  >
    <ResourceLink groupVersionKind={groupVersionKind} linkTo={false} name={optionName} />
  </SelectOption>
);

export default FilterSelectOption;
