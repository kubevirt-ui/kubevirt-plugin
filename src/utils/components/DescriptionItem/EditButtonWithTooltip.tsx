import React, { FC, memo, PropsWithChildren, ReactNode, useMemo } from 'react';

import { Tooltip } from '@patternfly/react-core';

import EditButton from '../EditButton/EditButton';

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
  const editButton = useMemo(
    () => (
      <EditButton isDisabled={!isEditable} isInline onClick={onEditClick} testId={testId}>
        {children}
      </EditButton>
    ),
    [onEditClick, testId, isEditable, children],
  );

  if (!isEditable && tooltipContent) {
    return (
      <Tooltip content={tooltipContent}>
        <span>{editButton}</span>
      </Tooltip>
    );
  }

  return editButton;
};

export default memo(EditButtonWithTooltip);
