import React, { FC, ReactNode, useState } from 'react';

import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownList,
  ExpandableSection,
  Title,
  TitleSizes,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './GettingStartedGrid.scss';

type GettingStartedGridProps = {
  children?: ReactNode[];
  onHide?: () => void;
};

export const GettingStartedGrid: FC<GettingStartedGridProps> = ({ children, onHide }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  const actionDropdownItem: any[] = [];

  if (onHide) {
    actionDropdownItem.push(
      <DropdownItem
        description={t(
          'You can always bring these getting started resources back into view by clicking Show getting started resources in the page heading.',
        )}
        component="button"
        data-test="hide"
        key="action"
        onClick={onHide}
      >
        {t('Hide from view')}
      </DropdownItem>,
    );
  }

  const title = t('Getting started resources');
  const titleTooltip = t(
    'Use our collection of resources to help you get started with virtualization.',
  );

  return (
    <Card className="kv-getting-started-grid" data-test="getting-started">
      <ExpandableSection
        toggleContent={
          <Title data-test="title" headingLevel="h2" size={TitleSizes.lg}>
            {title}{' '}
            <Tooltip className="kv-getting-started-grid__tooltip" content={titleTooltip}>
              <span
                aria-label={t('More info')}
                className="kv-getting-started-grid__tooltip-icon"
                role="button"
              >
                <OutlinedQuestionCircleIcon />
              </span>
            </Tooltip>
          </Title>
        }
        className="kv-getting-started-grid__expandable pf-m-display-lg"
      >
        <CardHeader
          actions={
            actionDropdownItem.length > 0
              ? {
                  actions: (
                    <Dropdown
                      className="ocs-getting-started-grid__action-dropdown"
                      isOpen={isOpen}
                      onOpenChange={setIsOpen}
                      popperProps={{ position: 'right' }}
                      toggle={KebabToggle({ isExpanded: isOpen, onClick: onToggle })}
                    >
                      <DropdownList>{actionDropdownItem}</DropdownList>
                    </Dropdown>
                  ),
                  className: null,
                  hasNoOffset: false,
                }
              : null
          }
          className="kv-getting-started-grid__header"
        />
        <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
      </ExpandableSection>
    </Card>
  );
};
