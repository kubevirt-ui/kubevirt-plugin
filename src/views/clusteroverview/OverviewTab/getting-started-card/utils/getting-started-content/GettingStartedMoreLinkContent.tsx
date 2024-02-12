import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { Button } from '@patternfly/react-core';

import { GettingStartedLink } from '../types';

export type GettingStartedMoreLinkContentProps = {
  moreLink: GettingStartedLink;
};

const GettingStartedMoreLinkContent: React.FC<GettingStartedMoreLinkContentProps> = ({
  moreLink,
}) => {
  if (!moreLink) {
    return null;
  }

  if (moreLink?.onClick) {
    const handleClick = moreLink.onClick;
    return (
      <Button data-test={`item ${moreLink.id}`} isInline onClick={handleClick} variant="link">
        {moreLink.title}
      </Button>
    );
  }

  if (moreLink?.external) {
    return (
      <a
        className="co-external-link"
        data-test={`item ${moreLink.id}`}
        href={moreLink.href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {moreLink.title}
      </a>
    );
  }

  return (
    <Link data-test={`item ${moreLink.id}`} to={moreLink.href}>
      {moreLink.title}
    </Link>
  );
};

export default GettingStartedMoreLinkContent;
