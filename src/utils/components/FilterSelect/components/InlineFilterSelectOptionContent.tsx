import React, { type FC, type JSX } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { type EnhancedSelectOptionProps } from '../utils/types';

type InlineFilterSelectOptionContentProps = {
  option: EnhancedSelectOptionProps;
};

const InlineFilterSelectOptionContent: FC<InlineFilterSelectOptionContentProps> = ({
  option,
}): JSX.Element => {
  const name = String(option.label ?? option.value);

  return !isEmpty(option?.groupVersionKind) ? (
    <ResourceLink groupVersionKind={option.groupVersionKind} linkTo={false} name={name} />
  ) : (
    <>{option?.children}</>
  );
};

export default InlineFilterSelectOptionContent;
