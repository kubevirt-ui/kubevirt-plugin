import React, { FC, memo, PropsWithChildren, ReactNode, SyntheticEvent } from 'react';

import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonWithTooltipProps = PropsWithChildren<{
  isEditable: boolean;
  onEditClick: () => void;
  testId: string;
  tooltipContent?: ReactNode;
}>;

const EditButtonWithTooltip: FC<EditButtonWithTooltipProps> = ({
  children,
  isEditable,
  onEditClick,
  testId,
  tooltipContent,
}) => {
  const EditButton = () => (
    <Button
      onClick={(e: SyntheticEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onEditClick?.();
      }}
      data-test-id={testId}
      icon={<PencilAltIcon />}
      iconPosition="end"
      isDisabled={!isEditable}
      isInline
      variant={ButtonVariant.link}
    >
      {children}
    </Button>
  );

  if (!isEditable && tooltipContent) {
    return (
      <Tooltip content={tooltipContent}>
        <span>
          <EditButton />
        </span>
      </Tooltip>
    );
  }

  return <EditButton />;
};

export default memo(EditButtonWithTooltip);
