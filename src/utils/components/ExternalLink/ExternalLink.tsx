import React, { FC, ReactNode } from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type ExternalLinkProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  dataTestID?: string;
  hideIcon?: boolean;
  href: string;
  stopPropagation?: boolean;
  text?: ReactNode;
};

const ExternalLink: FC<ExternalLinkProps> = ({
  ariaLabel,
  children,
  className = '',
  dataTestID,
  hideIcon,
  href,
  stopPropagation,
  text,
}) => (
  <Button
    aria-label={ariaLabel}
    className={className}
    component="a"
    data-test-id={dataTestID}
    href={href}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition="end"
    isInline
    rel="noopener noreferrer"
    target="_blank"
    variant="link"
    {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
  >
    {children ?? text}
  </Button>
);

export default ExternalLink;
