import * as React from 'react';

import { SelectOption } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../constants';
import { EnvironmentOption } from '../utils';

type EnvironmentSelectOptionProps = {
  isDisabled?: boolean;
  kind: EnvironmentKind;
  name: string;
};

const EnvironmentSelectOption: React.FC<EnvironmentSelectOptionProps> = ({
  isDisabled,
  kind,
  name,
}) => (
  <SelectOption isDisabled={isDisabled} value={new EnvironmentOption(name, kind)}>
    <span className="sr-only">{kind}</span>
    <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
    {name}
  </SelectOption>
);

export default EnvironmentSelectOption;
