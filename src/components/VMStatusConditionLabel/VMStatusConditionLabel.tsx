import * as React from 'react';

import { V1VirtualMachineCondition } from '@kubevirt-types';
import { Label, LabelGroup, Popover, PopoverPosition } from '@patternfly/react-core';

export const VMStatusConditionLabel: React.FC<V1VirtualMachineCondition> = React.memo(
  (condition) => {
    return (
      <Popover
        position={PopoverPosition.top}
        aria-label="Condition Popover"
        bodyContent={() => <div>{condition?.message}</div>}
      >
        <Label
          color="grey"
          isTruncated
          href="#"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {condition?.reason}={condition?.status}
        </Label>
      </Popover>
    );
  },
);
VMStatusConditionLabel.displayName = 'VMStatusConditionLabel';

export const VMStatusConditionLabelList: React.FC<{ conditions: V1VirtualMachineCondition[] }> =
  React.memo(({ conditions }) => {
    return (
      <LabelGroup>
        {conditions.map(({ message, reason, status, type }) => (
          <VMStatusConditionLabel
            key={reason}
            message={message}
            reason={reason}
            status={status}
            type={type}
          />
        ))}
      </LabelGroup>
    );
  });
VMStatusConditionLabelList.displayName = 'VMStatusConditionLabelList';
