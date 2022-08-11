import React, { memo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { LabelGroup } from '@patternfly/react-core';

import { MigrationPolicySelector } from './MigrationPolicySelector';

type MigrationPolicySelectorListProps = {
  selector: { [key: string]: string };
  isVMILabel?: boolean;
};

export const MigrationPolicySelectorList: React.FC<MigrationPolicySelectorListProps> = memo(
  ({ selector, isVMILabel }) => {
    if (isEmpty(selector)) return null;
    return (
      <LabelGroup>
        {Object.entries(selector)?.map(([key, value]) => (
          <MigrationPolicySelector key={key} matchKey={key} value={value} isVMILabel={isVMILabel} />
        ))}
      </LabelGroup>
    );
  },
);
