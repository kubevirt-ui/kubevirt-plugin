import React, { memo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { LabelGroup } from '@patternfly/react-core';

import { MigrationPolicyMatchLabelSelectorLabel } from './MigrationPolicyMatchLabelSelectorLabel';

type MigrationPolicyMatchLabelSelectorListProps = {
  matchLabels: { [key: string]: string };
  isVMILabel?: boolean;
};

export const MigrationPolicyMatchLabelSelectorList: React.FC<MigrationPolicyMatchLabelSelectorListProps> =
  memo(({ matchLabels, isVMILabel }) => {
    if (isEmpty(matchLabels)) return null;
    return (
      <LabelGroup>
        {Object.entries(matchLabels)?.map(([key, value]) => (
          <MigrationPolicyMatchLabelSelectorLabel
            key={key}
            matchKey={key}
            value={value}
            isVMILabel={isVMILabel}
          />
        ))}
      </LabelGroup>
    );
  });
