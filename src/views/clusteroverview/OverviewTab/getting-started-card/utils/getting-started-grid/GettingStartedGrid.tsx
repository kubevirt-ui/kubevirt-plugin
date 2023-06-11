import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  KebabToggle,
  Popover,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './GettingStartedGrid.scss';

type GettingStartedGridProps = {
  children?: React.ReactNode[];
  onHide?: () => void;
};

export const GettingStartedGrid: React.FC<GettingStartedGridProps> = ({ children, onHide }) => {
  const { t } = useKubevirtTranslation();
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);
  const onToggle = () => setMenuIsOpen((open) => !open);

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
  const titleTooltip = (
    <span className="kv-getting-started-grid__tooltip">
      {t('Use our collection of resources to help you get started with virtualization.')}
    </span>
  );

  return (
    <Card className="kv-getting-started-grid" data-test="getting-started">
      <CardHeader className="kv-getting-started-grid__header">
        <CardTitle>
          <Title data-test="title" headingLevel="h2" size={TitleSizes.lg}>
            {title}{' '}
            <Popover bodyContent={titleTooltip}>
              <span
                aria-label={t('More info')}
                className="kv-getting-started-grid__tooltip-icon"
                role="button"
              >
                <OutlinedQuestionCircleIcon />
              </span>
            </Popover>
          </Title>
        </CardTitle>
        {actionDropdownItem.length > 0 ? (
          <CardActions>
            <Dropdown
              className="ocs-getting-started-grid__action-dropdown"
              dropdownItems={actionDropdownItem}
              isOpen={menuIsOpen}
              isPlain
              position="right"
              toggle={<KebabToggle data-test="actions" onToggle={onToggle} />}
            />
          </CardActions>
        ) : null}
      </CardHeader>
      <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
    </Card>
  );
};
