import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
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
      </CardHeader>
      <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
    </Card>
  );
};
