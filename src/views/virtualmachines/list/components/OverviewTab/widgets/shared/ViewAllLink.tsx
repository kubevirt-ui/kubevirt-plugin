import { type AnchorHTMLAttributes, type FC, type JSX, useMemo } from 'react';
import { Link } from 'react-router';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HidableTooltip from '@kubevirt-utils/components/HidableTooltip/HidableTooltip';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button } from '@patternfly/react-core';

import './ViewAllLink.scss';

type ViewAllLinkProps = {
  'aria-label'?: string;
  disabled?: boolean;
  disabledTooltip?: string;
  /** Full URL for spoke / external console; opens in a new tab. Omit on hub when using `linkPath`. */
  href?: string;
  label?: string;
  /** In-console route; use without `href` for hub. When both were passed, `linkPath` wins (internal). */
  linkPath?: string;
  onClick?: () => void;
};

const ViewAllLink: FC<ViewAllLinkProps> = ({
  'aria-label': ariaLabel,
  disabled,
  disabledTooltip,
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
        ? (props: AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element => (
            <Link {...props} to={linkPath} />
          )
        : undefined,
    [linkPath],
  );

  if (disabled) {
    return (
      <HidableTooltip content={disabledTooltip ?? ''} hidden={!disabledTooltip}>
        <Button
          aria-label={ariaLabel}
          className="view-all-link"
          isAriaDisabled
          isInline
          variant="link"
        >
          {text}
        </Button>
      </HidableTooltip>
    );
  }

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
