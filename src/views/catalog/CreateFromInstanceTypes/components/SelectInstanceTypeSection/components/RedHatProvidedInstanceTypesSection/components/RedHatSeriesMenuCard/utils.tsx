import React, { Fragment } from 'react';

export const renderMarkdownTooltip = (text: string) =>
  text ? (
    <div>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {line.split(/(\*\*?[^*]+\*\*?)/g).map((part, j) => {
            if (part.startsWith('*') && part.endsWith('*')) {
              return <strong key={j}>{part.slice(1, -1)}</strong>;
            }
            return part || null;
          })}
          {i < text.split('\n').length - 1 && <br />}
        </Fragment>
      ))}
    </div>
  ) : null;
