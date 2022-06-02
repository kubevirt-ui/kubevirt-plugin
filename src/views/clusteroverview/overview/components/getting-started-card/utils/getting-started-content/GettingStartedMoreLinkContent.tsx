import * as React from 'react';
import { Link } from 'react-router-dom';

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
      <Button onClick={handleClick} isInline variant="link" data-test={`item ${moreLink.id}`}>
        {moreLink.title}
      </Button>
    );
  }

  if (moreLink?.external) {
    return (
      <a
        href={moreLink.href}
        target="_blank"
        className="co-external-link"
        rel="noopener noreferrer"
        data-test={`item ${moreLink.id}`}
      >
        {moreLink.title}
      </a>
    );
  }

  return (
    <Link to={moreLink.href} data-test={`item ${moreLink.id}`}>
      {moreLink.title}
    </Link>
  );
};

export default GettingStartedMoreLinkContent;
