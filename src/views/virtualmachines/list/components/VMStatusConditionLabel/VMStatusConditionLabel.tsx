import React, { type FC, memo } from 'react';

import { type V1VirtualMachineCondition } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { Label, LabelGroup, Popover, PopoverPosition } from '@patternfly/react-core';

import { formatConditionLabel } from './utils';

export const VMStatusConditionLabel: FC<V1VirtualMachineCondition> = memo((condition) => {
  const bodyContentMessage = condition?.message ?? condition?.reason;

  const InnerLabel = (
    <Label color="grey" onClick={bodyContentMessage ? (e) => e.preventDefault() : undefined}>
      {formatConditionLabel(condition)}
    </Label>
  );

  if (!bodyContentMessage) {
    return InnerLabel;
  }

  return (
    <Popover
      aria-label="Condition Popover"
      bodyContent={() => <div>{bodyContentMessage}</div>}
      position={PopoverPosition.top}
    >
      {InnerLabel}
    </Popover>
  );
});
VMStatusConditionLabel.displayName = 'VMStatusConditionLabel';

export const VMStatusConditionLabelList: FC<{ conditions: V1VirtualMachineCondition[] }> = memo(
  ({ conditions }) => {
    return (
      <LabelGroup>
        {conditions?.map(({ message, reason, status, type }) => (
          <VMStatusConditionLabel
            key={type}
            message={message}
            reason={reason}
            status={status}
            type={type}
          />
        ))}
      </LabelGroup>
    );
  },
);
VMStatusConditionLabelList.displayName = 'VMStatusConditionLabelList';
