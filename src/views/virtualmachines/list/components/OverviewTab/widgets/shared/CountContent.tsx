import React, { FC, ReactNode } from 'react';
import { Link } from 'react-router';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';

type CountContentProps = {
  ariaLabel?: string;
  displayValue: ReactNode;
  href?: string;
  isExternal?: boolean;
  statusMessage?: string;
};

const CountContent: FC<CountContentProps> = ({
  ariaLabel,
  displayValue,
  href,
  isExternal,
  statusMessage,
}) => {
  if (href && isExternal) {
    return (
      <ExternalLink ariaLabel={ariaLabel} className="status-count-item__link" hideIcon href={href}>
        {displayValue}
      </ExternalLink>
    );
  }

  if (href) {
    return (
      <Link aria-label={ariaLabel} className="status-count-item__link" to={href}>
        {displayValue}
      </Link>
    );
  }

  return (
    <span className={statusMessage ? 'status-count-item__text' : 'status-count-item__count'}>
      {displayValue}
    </span>
  );
};

export default CountContent;
