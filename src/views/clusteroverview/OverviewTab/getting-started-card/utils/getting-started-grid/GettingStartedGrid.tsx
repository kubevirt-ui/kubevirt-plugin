import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useToggle } from '@kubevirt-utils/hooks/useToggle';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  Title,
  TitleSizes,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

import './GettingStartedGrid.scss';

type GettingStartedGridProps = {
  children?: ReactNode[];
};

export const GettingStartedGrid: FC<GettingStartedGridProps> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useToggle('virtualization-getting-started-resources', true);

  const title = t('Getting started resources');
  const titleTooltip = t(
    'Use our collection of resources to help you get started with virtualization.',
  );

  const onExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card
      className="kv-getting-started-grid"
      data-test="getting-started"
      isExpanded={isExpanded}
      variant="secondary"
    >
      <CardHeader onExpand={onExpand}>
        <Title data-test="title" headingLevel="h2" id="tour-step-resources" size={TitleSizes.lg}>
          {title}{' '}
          <Tooltip content={titleTooltip}>
            <span
              aria-label={t('More info')}
              className="kv-getting-started-grid__tooltip-icon"
              role="button"
            >
              <OutlinedQuestionCircleIcon />
            </span>
          </Tooltip>
        </Title>
      </CardHeader>
      <CardExpandableContent>
        <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
      </CardExpandableContent>
    </Card>
  );
};
