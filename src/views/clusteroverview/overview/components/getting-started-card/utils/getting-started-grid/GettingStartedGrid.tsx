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
  onHide?: () => void;
  children?: React.ReactNode[];
};

export const GettingStartedGrid: React.FC<GettingStartedGridProps> = ({ onHide, children }) => {
  const { t } = useKubevirtTranslation();
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);
  const onToggle = () => setMenuIsOpen((open) => !open);

  const actionDropdownItem: any[] = [];

  if (onHide) {
    actionDropdownItem.push(
      <DropdownItem
        key="action"
        component="button"
        description={t(
          'You can always bring these getting started resources back into view by clicking Show getting started resources in the page heading.',
        )}
        onClick={onHide}
        data-test="hide"
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
          <Title headingLevel="h2" size={TitleSizes.lg} data-test="title">
            {title}{' '}
            <Popover bodyContent={titleTooltip}>
              <span
                role="button"
                aria-label={t('More info')}
                className="kv-getting-started-grid__tooltip-icon"
              >
                <OutlinedQuestionCircleIcon />
              </span>
            </Popover>
          </Title>
        </CardTitle>
        {actionDropdownItem.length > 0 ? (
          <CardActions>
            <Dropdown
              isOpen={menuIsOpen}
              isPlain
              toggle={<KebabToggle onToggle={onToggle} data-test="actions" />}
              position="right"
              dropdownItems={actionDropdownItem}
              className="ocs-getting-started-grid__action-dropdown"
            />
          </CardActions>
        ) : null}
      </CardHeader>
      <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
    </Card>
  );
};
