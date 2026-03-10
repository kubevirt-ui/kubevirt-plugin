import React from 'react';

import { Stack } from '@patternfly/react-core';

export const renderMarkdownTooltip = (text: string) =>
  text ? (
    <Stack hasGutter>
      {text.split('\n\n').map((paragraph, i) => (
        <p key={i}>
          {paragraph.split(/(\*\*?[^*]+\*\*?)/g).map((part, j) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={j}>{part.slice(1, -1)}</strong>;
            }
            return part || null;
          })}
        </p>
      ))}
    </Stack>
  ) : null;
