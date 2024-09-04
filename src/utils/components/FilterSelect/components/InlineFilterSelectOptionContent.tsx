import React, { FC } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { EnhancedSelectOptionProps } from '../utils/types';

type InlineFilterSelectOptionContentProps = {
  option: EnhancedSelectOptionProps;
};

const InlineFilterSelectOptionContent: FC<InlineFilterSelectOptionContentProps> = ({ option }) =>
  !isEmpty(option?.groupVersionKind) ? (
    <ResourceLink groupVersionKind={option.groupVersionKind} linkTo={false} name={option.value} />
  ) : (
    <>{option?.children}</>
  );

export default InlineFilterSelectOptionContent;
