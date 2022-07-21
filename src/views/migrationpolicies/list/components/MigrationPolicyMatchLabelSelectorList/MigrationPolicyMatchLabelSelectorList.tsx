import React, { memo } from 'react';

import { MigrationPolicyMatchLabelSelectorLabel } from './MigrationPolicyMatchLabelSelectorLabel';

type MigrationPolicyMatchLabelSelectorListProps = {
  matchLabels: { [key: string]: string };
  isVMILabel?: boolean;
};

export const MigrationPolicyMatchLabelSelectorList: React.FC<MigrationPolicyMatchLabelSelectorListProps> =
  memo(({ matchLabels, isVMILabel }) => {
    return (
      <>
        {Object.entries(matchLabels)?.map(([key, value]) => (
          <MigrationPolicyMatchLabelSelectorLabel
            key={key}
            matchKey={key}
            value={value}
            isVMILabel={isVMILabel}
          />
        ))}
      </>
    );
  });
