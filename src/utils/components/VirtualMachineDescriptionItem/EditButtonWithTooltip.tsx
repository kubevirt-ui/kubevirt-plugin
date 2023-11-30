import React, { FC, PropsWithChildren, ReactNode, SyntheticEvent } from 'react';

import { Button, Flex, Tooltip } from '@patternfly/react-core';
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
      isDisabled={!isEditable}
      isInline
      variant="link"
    >
      <Flex>
        {children}
        <PencilAltIcon className="co-icon-space-l" />
      </Flex>
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

export default EditButtonWithTooltip;
