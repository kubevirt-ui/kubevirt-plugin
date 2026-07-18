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
  onClick?: () => void;
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
  onClick,
  stopPropagation,
  text,
}) => (
  <Button
    onClick={(e) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      onClick?.();
    }}
    aria-label={ariaLabel}
    className={className}
    component="a"
    ouiaId={dataTestID}
    href={href}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition="end"
    isInline
    rel="noopener noreferrer"
    target="_blank"
    variant="link"
  >
    {children ?? text}
  </Button>
);

export default ExternalLink;
