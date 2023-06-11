import * as React from 'react';
import { Link } from 'react-router-dom';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';

import { GettingStartedLink } from '../types';

import './GettingStartedLinkExtraContent.scss';

export type GettingStartedLinkExtraContentProps = {
  link: GettingStartedLink;
};

const GettingStartedLinkExtraContent: React.FC<GettingStartedLinkExtraContentProps> = ({
  link,
}) => {
  let ExtraLink = null;

  if (link?.secondaryLinkHref) {
    ExtraLink = link?.secondaryLinkExternal ? (
      <ExternalLink
        className="getting-started-link-extra-content__more-block--link"
        href={link?.secondaryLinkHref}
        text={link?.secondaryLinkText}
      />
    ) : (
      <Link to={link?.secondaryLinkHref}>{link?.secondaryLinkText}</Link>
    );
  }

  return (
    <div className="getting-started-link-extra-content--more-block">
      {link?.description}
      {link?.showSecondaryLink && ExtraLink}
    </div>
  );
};

export default GettingStartedLinkExtraContent;
