import * as React from 'react';

import { SelectOption } from '@patternfly/react-core';

import { EnvironmentKind, MapKindToAbbr } from '../utils/constants';
import { EnvironmentOption } from '../utils/utils';

type EnvironmentSelectOptionProps = {
  kind: EnvironmentKind;
  name: string;
  isDisabled?: boolean;
};

const EnvironmentSelectOption: React.FC<EnvironmentSelectOptionProps> = ({
  name,
  kind,
  isDisabled,
}) => (
  <SelectOption value={new EnvironmentOption(name, kind)} isDisabled={isDisabled}>
    <span className="sr-only">{kind}</span>
    <span className={`co-m-resource-icon co-m-resource-${kind}`}>{MapKindToAbbr[kind]}</span>
    {name}
  </SelectOption>
);

export default EnvironmentSelectOption;
