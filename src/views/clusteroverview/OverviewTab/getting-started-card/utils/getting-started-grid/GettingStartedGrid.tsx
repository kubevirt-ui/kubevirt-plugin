import React, { FC, ReactNode, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Card,
  CardBody,
  CardHeader,
  ExpandableSection,
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
  const [isExpanded, setIsExpanded] = useState(true);

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
        isExpanded={isExpanded}
        onToggle={(_, expand) => setIsExpanded(expand)}
      >
        <CardHeader className="kv-getting-started-grid__header" />
        <CardBody className="kv-getting-started-grid__content">{children}</CardBody>
      </ExpandableSection>
    </Card>
  );
};
