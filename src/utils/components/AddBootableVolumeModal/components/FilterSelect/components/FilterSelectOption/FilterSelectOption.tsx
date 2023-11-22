import React, { FC } from 'react';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk-internal/lib/extensions/console-types';
import { SelectOption } from '@patternfly/react-core';

type FilterSelectOptionProps = {
  groupVersionKind: K8sGroupVersionKind;
  optionLabel: string;
  optionName: string;
};

const FilterSelectOption: FC<FilterSelectOptionProps> = ({
  groupVersionKind,
  optionLabel,
  optionName,
}) => (
  <SelectOption
    data-test-id={`${optionLabel}-select-option-${optionName}`}
    key={optionName}
    value={optionName}
  >
    <ResourceLink groupVersionKind={groupVersionKind} linkTo={false} name={optionName} />
  </SelectOption>
);

export default FilterSelectOption;
