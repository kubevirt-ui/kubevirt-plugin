import * as React from 'react';
import { KUBEVIRT_HIDE_GETTING_STARTED } from 'src/views/clusteroverview/overview/utils/utils';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
  Popover,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './GettingStartedGrid.scss';

type GettingStartedGridProps = {
  children?: React.ReactNode[];
};

export const GettingStartedGrid: React.FC<GettingStartedGridProps> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const [hideGettingStarted, setHideGettingStarted] = useLocalStorage(
    KUBEVIRT_HIDE_GETTING_STARTED,
  );
  const title = t('Getting started resources');
  const titleTooltip = (
    <span className="kv-getting-started-grid__tooltip">
      {t('Use our collection of resources to help you get started with virtualization.')}
    </span>
  );
  const items = [
    <DropdownItem
      onClick={() => setHideGettingStarted(true)}
      key="hide-getting-started"
      className="kv-getting-started-grid__dropdown-item"
      description={t(
        'You can always bring these getting started resources back into view by clicking Show getting started resources in the page heading.',
      )}
    >
      {t('Hide from view')}
    </DropdownItem>,
  ];

  return (
    !hideGettingStarted && (
      <Card className="kv-getting-started-grid" data-test="getting-started">
        <CardHeader className="kv-getting-started-grid__header">
          <CardTitle className="kv-getting-started-grid__title">
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
            <Dropdown
              onSelect={() => setIsDropdownOpen(false)}
              toggle={<KebabToggle onToggle={setIsDropdownOpen} id="toggle-id-6" />}
              isOpen={isDropdownOpen}
              isPlain
              dropdownItems={items}
              position={DropdownPosition.right}
            />
          </CardTitle>
        </CardHeader>
        <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
      </Card>
    )
  );
};
