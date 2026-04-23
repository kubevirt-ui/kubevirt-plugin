import React, { FC } from 'react';
import { Link } from 'react-router';

import { Button, ButtonVariant } from '@patternfly/react-core';

import { GettingStartedLink } from '../types';

export type GettingStartedMoreLinkContentProps = {
  moreLink: GettingStartedLink;
};

const GettingStartedMoreLinkContent: FC<GettingStartedMoreLinkContentProps> = ({ moreLink }) => {
  if (!moreLink) {
    return null;
  }

  if (moreLink?.onClick) {
    const handleClick = moreLink.onClick;
    return (
      <Button
        data-test={`item ${moreLink.id}`}
        isInline
        onClick={handleClick}
        variant={ButtonVariant.link}
      >
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
