import React, { memo } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Popover, PopoverPosition } from '@patternfly/react-core';

import '../MigrationPolicySelectorLabel.scss';

type MigrationPolicySelectorProps = {
  isVMILabel?: boolean;
  matchKey: string;
  value: string;
};

export const MigrationPolicySelector: React.FC<MigrationPolicySelectorProps> = memo(
  ({ isVMILabel, matchKey, value }) => {
    const { t } = useKubevirtTranslation();
    const labelBodyContent = `${matchKey}: ${value}`;
    return (
      <Popover
        aria-label="Match label selector"
        bodyContent={`${matchKey}: ${value}`}
        headerContent={t('Match label')}
        position={PopoverPosition.top}
      >
        <Label
          onClick={(e) => {
            e.preventDefault();
          }}
          color={isVMILabel ? 'grey' : 'blue'}
          isTruncated
        >
          <div className={classNames({ 'kv-migration-policy__label-vm': isVMILabel })}>
            {labelBodyContent}
          </div>
        </Label>
      </Popover>
    );
  },
);
