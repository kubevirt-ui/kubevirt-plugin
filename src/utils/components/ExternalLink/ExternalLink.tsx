import type { FC, ReactNode } from 'react';

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
    aria-label={ariaLabel}
    className={className}
    component="a"
    data-test={dataTestID}
    href={href}
    icon={hideIcon ? undefined : <ExternalLinkAltIcon />}
    iconPosition="end"
    isInline
    onClick={(e) => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      onClick?.();
    }}
    rel="noopener noreferrer"
    target="_blank"
    variant="link"
  >
    {children ?? text}
  </Button>
);

export default ExternalLink;
