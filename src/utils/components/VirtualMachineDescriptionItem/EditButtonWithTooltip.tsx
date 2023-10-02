import React, { FC, PropsWithChildren, ReactNode } from 'react';

import { Button, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

type EditButtonWithTooltipProps = PropsWithChildren<{
  isEditable: boolean;
  onEditClick: () => void;
  testId: string;
  tooltipContent: ReactNode;
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
      className="pf-u-w-100"
      data-test-id={testId}
      isDisabled={!isEditable}
      isInline
      onClick={onEditClick}
      type="button"
      variant="link"
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
