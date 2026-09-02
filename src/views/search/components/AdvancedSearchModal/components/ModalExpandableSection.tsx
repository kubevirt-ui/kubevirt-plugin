import React, { type FC, type ReactNode, useState } from 'react';

import { ExpandableSection, Title } from '@patternfly/react-core';

type ModalExpandableSectionProps = {
  children?: ReactNode;
  isDefaultExpanded?: boolean;
  title: string;
};

const ModalExpandableSection: FC<ModalExpandableSectionProps> = ({
  children,
  isDefaultExpanded = true,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      toggleContent={
        <Title className="pf-v6-u-text-color-regular" headingLevel="h3" size="md">
          {title}
        </Title>
      }
    >
      <div className="pf-v6-u-px-sm">{children}</div>
    </ExpandableSection>
  );
};

export default ModalExpandableSection;
