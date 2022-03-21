import * as React from 'react';
import { Link } from 'react-router-dom';

import { Button, FlexItem } from '@patternfly/react-core';

import { GettingStartedLink } from '../types';

export const getLinkComponent = (link: GettingStartedLink) => {
  if (!link?.href) {
    return 'button';
  } else if (link?.external) {
    return 'a';
  }
  return Link as any;
};
export const getMoreLinkContent = (moreLink: GettingStartedLink) => {
  if (!moreLink) {
    return null;
  }

  const handleMoreLinkClick = moreLink.onClick;

  if (moreLink.onClick) {
    return (
      <FlexItem>
        <Button
          onClick={handleMoreLinkClick}
          isInline
          variant="link"
          data-test={`item ${moreLink.id}`}
        >
          {moreLink.title}
        </Button>
      </FlexItem>
    );
  }

  if (moreLink.external) {
    return (
      <FlexItem>
        <a
          href={moreLink.href}
          target="_blank"
          className="co-external-link"
          rel="noopener noreferrer"
          data-test={`item ${moreLink.id}`}
        >
          {moreLink.title}
        </a>
      </FlexItem>
    );
  }

  return (
    <FlexItem>
      <Link to={moreLink.href} data-test={`item ${moreLink.id}`}>
        {moreLink.title}
      </Link>
    </FlexItem>
  );
};
