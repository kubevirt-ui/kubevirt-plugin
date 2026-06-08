import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Flex,
  Label,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import { getSearchTipsSections } from './constants';

import './search-tips-popover.scss';

type SearchTipsPopoverProps = {
  onSelectTip: (query: string) => void;
};

const SearchTipsPopover: FC<SearchTipsPopoverProps> = ({ onSelectTip }) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const sections = getSearchTipsSections(t, isACMPage);

  return (
    <Popover
      bodyContent={
        <div className="search-tips-popover__body">
          <Content className="pf-v6-u-mb-sm" component={ContentVariants.small}>
            {t('Click any example below to try it in the search bar')}
          </Content>
          <Stack hasGutter>
            {sections.map((section) => (
              <StackItem key={section.title}>
                <Card isCompact>
                  <CardBody>
                    <strong>{section.title}</strong>
                    <Stack>
                      {section.tips.map((tip) => (
                        <Flex
                          className="pf-v6-u-mt-sm"
                          key={tip.query}
                          spaceItems={{ default: 'spaceItemsSm' }}
                        >
                          <Label onClick={() => onSelectTip(tip.query)} variant="outline">
                            {tip.query}
                          </Label>
                          <span className="pf-v6-u-font-size-xs">{tip.description}</span>
                        </Flex>
                      ))}
                      {section.note && (
                        <StackItem>
                          <Content className="pf-v6-u-mt-sm" component={ContentVariants.small}>
                            {section.note}
                          </Content>
                        </StackItem>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              </StackItem>
            ))}
          </Stack>
        </div>
      }
      enableFlip={false}
      headerContent={t('Search tips')}
      maxWidth="380px"
      position={PopoverPosition.bottomEnd}
    >
      <Button aria-label={t('Search tips')} icon={<OutlinedQuestionCircleIcon />} variant="plain" />
    </Popover>
  );
};

export default SearchTipsPopover;
