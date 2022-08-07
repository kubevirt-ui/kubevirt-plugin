import React, { memo } from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, Popover, PopoverPosition } from '@patternfly/react-core';

import '../MigrationPolicySelectorLabel.scss';

type MigrationPolicyMatchExpressionSelectorLabelProps = {
  matchKey: string;
  operator: string;
  values?: string[];
  isVMILabel?: boolean;
};

export const MigrationPolicyMatchExpressionSelectorLabel: React.FC<MigrationPolicyMatchExpressionSelectorLabelProps> =
  memo(({ matchKey, operator, values, isVMILabel }) => {
    const { t } = useKubevirtTranslation();

    const labelBodyContent = `${matchKey} ${operator}`;
    return (
      <Popover
        position={PopoverPosition.top}
        aria-label="Condition Popover"
        bodyContent={() => (
          <>
            {t('Key: {{matchKey}} Operator: {{operator}} ', { matchKey, operator })}
            {!isEmpty(values) && t('values: {{values}}', { values: values.join(', ') })}
          </>
        )}
        headerContent={'Match expression'}
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
