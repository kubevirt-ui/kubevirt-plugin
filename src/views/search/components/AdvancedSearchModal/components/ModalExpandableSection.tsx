import React, { FC, useState } from 'react';

import { ExpandableSection, Title } from '@patternfly/react-core';

type ModalExpandableSectionProps = {
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
      toggleContent={
        <Title className="pf-v6-u-text-color-regular" headingLevel="h2" size="lg">
          {title}
        </Title>
      }
      isExpanded={isExpanded}
      onToggle={(_, expanded) => setIsExpanded(expanded)}
    >
      <div className="pf-v6-u-px-sm">{children}</div>
    </ExpandableSection>
  );
};

export default ModalExpandableSection;
