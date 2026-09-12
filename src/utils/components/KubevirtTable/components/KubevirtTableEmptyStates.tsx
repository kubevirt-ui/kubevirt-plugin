import React, { type ReactNode } from 'react';

import { EmptyState, EmptyStateVariant } from '@patternfly/react-core';

import MutedTextSpan from '../../MutedTextSpan/MutedTextSpan';

export const renderNoDataContent = (content: ReactNode): ReactNode => {
  if (typeof content === 'string') {
    return <EmptyState headingLevel="h4" titleText={content} variant={EmptyStateVariant.xs} />;
  }
  return content;
};

export const renderNoFilteredDataContent = (content: ReactNode): ReactNode => {
  if (typeof content === 'string') {
    return <MutedTextSpan text={content} />;
  }
  return content;
};
