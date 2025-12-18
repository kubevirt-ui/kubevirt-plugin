import React, { FC } from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  className?: string;
  dataTestID?: string;
  href: string;
  stopPropagation?: boolean;
  text?: React.ReactNode;
};

const ExternalLink: FC<ExternalLinkProps> = ({
  children,
  className = '',
  dataTestID,
  href,
  stopPropagation,
  text,
}) => (
  <Button
    className={className}
    component="a"
    data-test-id={dataTestID}
    href={href}
    icon={<ExternalLinkAltIcon />}
    iconPosition="right"
    isInline
    rel="noopener noreferrer"
    target="_blank"
    variant="link"
    {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
  >
    {children || text}
  </Button>
);

export default ExternalLink;
