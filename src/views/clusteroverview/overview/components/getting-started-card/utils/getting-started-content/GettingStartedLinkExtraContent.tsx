import * as React from 'react';
import { Link } from 'react-router-dom';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';

import { GettingStartedLink } from '../types';

export type GettingStartedLinkExtraContentProps = {
  link: GettingStartedLink;
};

const GettingStartedLinkExtraContent: React.FC<GettingStartedLinkExtraContentProps> = ({
  link,
}) => {
  let ExtraLink = null;

  if (link?.moreLinkHref) {
    ExtraLink = link?.moreLinkExternal ? (
      <ExternalLink
        href={link?.moreLinkHref}
        text={link?.moreLinkText}
        additionalClassName="kv-getting-started-content__more-block--link"
      />
    ) : (
      <Link to={link?.moreLinkHref}>{link?.moreLinkText}</Link>
    );
  }

  return (
    <div className="kv-getting-started-content--more-block">
      {link?.description}
      {link?.showMoreLink && ExtraLink}
    </div>
  );
};

export default GettingStartedLinkExtraContent;
