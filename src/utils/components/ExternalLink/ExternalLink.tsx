import React, { FC } from 'react';

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
  <a
    className={className}
    data-test-id={dataTestID}
    href={href}
    rel="noopener noreferrer"
    target="_blank"
    {...(stopPropagation ? { onClick: (e) => e.stopPropagation() } : {})}
  >
    {children || text} <ExternalLinkAltIcon />
  </a>
);

export default ExternalLink;
