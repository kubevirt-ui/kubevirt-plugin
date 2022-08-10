import React, { memo } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Popover, PopoverPosition } from '@patternfly/react-core';

import '../MigrationPolicySelectorLabel.scss';

type MigrationPolicyMatchLabelSelectorLabelProps = {
  matchKey: string;
  value: string;
  isVMILabel?: boolean;
};

export const MigrationPolicyMatchLabelSelectorLabel: React.FC<MigrationPolicyMatchLabelSelectorLabelProps> =
  memo(({ matchKey, value, isVMILabel }) => {
    const { t } = useKubevirtTranslation();
    const labelBodyContent = `${matchKey}: ${value}`;
    return (
      <Popover
        position={PopoverPosition.top}
        aria-label="Match label selector"
        bodyContent={`${matchKey}: ${value}`}
        headerContent={t('Match label')}
      >
        <Label
          color={isVMILabel ? 'grey' : 'blue'}
          isTruncated
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <div className={classNames({ 'kv-migration-policy__label-vm': isVMILabel })}>
            {labelBodyContent}
          </div>
        </Label>
      </Popover>
    );
  });
