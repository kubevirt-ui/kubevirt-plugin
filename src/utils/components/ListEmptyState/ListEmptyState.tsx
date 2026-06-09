import React, { ComponentType, FC, ReactNode } from 'react';

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';

export type ListEmptyStateProps = {
  bodyContent?: ReactNode;
  buttonAction?: ReactNode;
  className?: string;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  icon?: ComponentType | null;
  learnMoreLink?: ReactNode;
  titleText: string;
  variant?: EmptyStateVariant;
};

const ListEmptyState: FC<ListEmptyStateProps> = ({
  bodyContent,
  buttonAction,
  className,
  headingLevel = 'h4',
  icon,
  learnMoreLink,
  titleText,
  variant = EmptyStateVariant.lg,
}) => (
  <EmptyState
    className={className}
    headingLevel={headingLevel}
    icon={icon === null ? undefined : icon ?? AddCircleOIcon}
    titleText={titleText}
    variant={variant}
  >
    {bodyContent && <EmptyStateBody>{bodyContent}</EmptyStateBody>}
    {(buttonAction || learnMoreLink) && (
      <EmptyStateFooter>
        {buttonAction && <EmptyStateActions>{buttonAction}</EmptyStateActions>}
        {learnMoreLink && <EmptyStateActions>{learnMoreLink}</EmptyStateActions>}
      </EmptyStateFooter>
    )}
  </EmptyState>
);

export default ListEmptyState;
