import * as React from 'react';

import {
  Flex,
  FlexItem,
  SimpleList,
  SimpleListItem,
  Skeleton,
  Text,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { GettingStartedLink } from '../types';

import GettingStartedLinkExtraContent from './GettingStartedLinkExtraContent';
import GettingStartedMoreLinkContent from './GettingStartedMoreLinkContent';
import { getLinkComponent } from './utils';

import './GettingStartedSectionContents.scss';

type GettingStartedSectionContentsProps = {
  id: string;
  icon?: React.ReactElement;
  title: string;
  titleColor?: string;
  description?: string;
  links: GettingStartedLink[];
  moreLink?: GettingStartedLink;
};

const GettingStartedSectionContents: React.FC<GettingStartedSectionContentsProps> = ({
  id,
  icon,
  title,
  titleColor,
  description,
  links,
  moreLink,
}) => {
  return (
    <Flex
      direction={{ default: 'column' }}
      grow={{ default: 'grow' }}
      className="getting-started-section-contents"
      data-test={`card ${id}`}
    >
      <Title headingLevel="h3" size={TitleSizes.md} style={{ color: titleColor }} data-test="title">
        {icon ? <span className="getting-started-section-contents__title-icon">{icon}</span> : null}
        {title}
      </Title>

      {description ? (
        <Text component={TextVariants.small} data-test="description">
          {description}
        </Text>
      ) : null}

      <Flex direction={{ default: 'column' }} grow={{ default: 'grow' }}>
        {links?.length > 0 ? (
          <SimpleList isControlled={false} className="getting-started-section-contents__list">
            {links.map((link) => {
              const handleClick = link.onClick;
              return link.loading ? (
                <li key={link.id}>
                  <Skeleton fontSize="sm" />
                </li>
              ) : (
                <span key={link.id}>
                  <SimpleListItem
                    component={getLinkComponent(link)}
                    componentClassName={link.external ? 'co-external-link' : 'co-goto-arrow'}
                    componentProps={
                      link.external
                        ? {
                            href: link.href,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            'data-test': `item ${link.id}`,
                          }
                        : {
                            to: link.href,
                            'data-test': `item ${link.id}`,
                          }
                    }
                    href={link.href}
                    onClick={handleClick}
                  >
                    {link.title}
                  </SimpleListItem>
                  <GettingStartedLinkExtraContent link={link} />
                </span>
              );
            })}
          </SimpleList>
        ) : null}
      </Flex>
      <FlexItem>
        <GettingStartedMoreLinkContent moreLink={moreLink} />
      </FlexItem>
    </Flex>
  );
};

export default GettingStartedSectionContents;
