import * as React from 'react';

import { V1VirtualMachineCondition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Label, LabelGroup, Popover, PopoverPosition } from '@patternfly/react-core';

export const VMStatusConditionLabel: React.FC<V1VirtualMachineCondition> = React.memo(
  (condition) => {
    return (
      <Popover
        aria-label="Condition Popover"
        bodyContent={() => <div>{condition?.message ?? condition?.reason}</div>}
        position={PopoverPosition.top}
      >
        <Label
          onClick={(e) => {
            e.preventDefault();
          }}
          color="grey"
          href="#"
          isTruncated
        >
          {condition?.type}={condition?.status}
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
  });
VMStatusConditionLabelList.displayName = 'VMStatusConditionLabelList';
