import React, { AnchorHTMLAttributes, FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import './ViewAllLink.scss';

type ViewAllLinkProps = {
  'aria-label'?: string;
  /** Full URL for spoke / external console; opens in a new tab. Omit on hub when using `linkPath`. */
  href?: string;
  label?: string;
  /** In-console route; use without `href` for hub. When both were passed, `linkPath` wins (internal). */
  linkPath?: string;
  onClick?: () => void;
};

const ViewAllLink: FC<ViewAllLinkProps> = ({
  'aria-label': ariaLabel,
  href,
  label,
  linkPath,
  onClick,
}) => {
  const { t } = useKubevirtTranslation();
  const text = label ?? t('View all');

  const LinkComponent = useMemo(
    () =>
      linkPath
        ? (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <Link {...props} to={linkPath} />
        : undefined,
    [linkPath],
  );

  // Prefer in-console navigation when `linkPath` is set (hub). Use `href` only for external/spoke URLs.
  if (linkPath) {
    return (
      <Button
        aria-label={ariaLabel}
        className="view-all-link"
        component={LinkComponent}
        isInline
        variant="link"
      >
        {text}
      </Button>
    );
  }

  if (href) {
    return (
      <ExternalLink ariaLabel={ariaLabel} className="view-all-link" href={href}>
        {text}
      </ExternalLink>
    );
  }

  if (!onClick) return null;

  return (
    <Button
      aria-label={ariaLabel}
      className="view-all-link"
      isInline
      onClick={onClick}
      variant="link"
    >
      {text}
    </Button>
  );
};

export default ViewAllLink;
