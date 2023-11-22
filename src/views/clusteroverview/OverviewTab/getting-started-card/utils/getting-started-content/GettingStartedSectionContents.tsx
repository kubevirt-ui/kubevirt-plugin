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
  description?: string;
  icon?: React.ReactElement;
  id: string;
  links: GettingStartedLink[];
  moreLink?: GettingStartedLink;
  title: string;
  titleColor?: string;
};

const GettingStartedSectionContents: React.FC<GettingStartedSectionContentsProps> = ({
  description,
  icon,
  id,
  links,
  moreLink,
  title,
  titleColor,
}) => {
  return (
    <Flex
      className="getting-started-section-contents"
      data-test={`card ${id}`}
      direction={{ default: 'column' }}
      grow={{ default: 'grow' }}
    >
      <Title data-test="title" headingLevel="h3" size={TitleSizes.md} style={{ color: titleColor }}>
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
          <SimpleList className="getting-started-section-contents__list" isControlled={false}>
            {links.map((link) => {
              const handleClick = link.onClick;
              return link.loading ? (
                <li key={link.id}>
                  <Skeleton fontSize="sm" />
                </li>
              ) : (
                <span key={link.id}>
                  <SimpleListItem
                    componentProps={
                      link.external
                        ? {
                            'data-test': `item ${link.id}`,
                            href: link.href,
                            rel: 'noopener noreferrer',
                            target: '_blank',
                          }
                        : {
                            'data-test': `item ${link.id}`,
                            to: link.href,
                          }
                    }
                    component={getLinkComponent(link)}
                    componentClassName={link.external ? 'co-external-link' : 'co-goto-arrow'}
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
