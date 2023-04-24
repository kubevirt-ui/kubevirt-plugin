import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { Button, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonWithTooltipProps = PropsWithChildren<{
  isEditable: boolean;
  tooltipContent: ReactNode;
  onEditClick: () => void;
  testId: string;
}>;

const EditButtonWithTooltip: FC<EditButtonWithTooltipProps> = ({
  isEditable,
  onEditClick,
  children,
  tooltipContent,
  testId,
}) => {
  const EditButton = () => (
    <Button
      type="button"
      isInline
      variant="link"
      isDisabled={!isEditable}
      onClick={onEditClick}
      data-test-id={testId}
      className="edit-button-on-content"
    >
      <Flex spaceItems={{ default: 'spaceItemsNone' }}>
        <FlexItem>{children}</FlexItem>
        <FlexItem>
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </FlexItem>
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
