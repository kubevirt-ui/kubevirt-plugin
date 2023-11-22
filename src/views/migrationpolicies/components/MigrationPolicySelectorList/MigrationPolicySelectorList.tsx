import React, { memo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { LabelGroup } from '@patternfly/react-core';

import { MigrationPolicySelector } from './MigrationPolicySelector';

type MigrationPolicySelectorListProps = {
  isVMILabel?: boolean;
  selector: { [key: string]: string };
};

export const MigrationPolicySelectorList: React.FC<MigrationPolicySelectorListProps> = memo(
  ({ isVMILabel, selector }) => {
    if (isEmpty(selector)) return null;
    return (
      <LabelGroup>
        {Object.entries(selector)?.map(([key, value]) => (
          <MigrationPolicySelector isVMILabel={isVMILabel} key={key} matchKey={key} value={value} />
        ))}
      </LabelGroup>
    );
  },
);
