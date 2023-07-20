import React, { FC, ReactNode, useState } from 'react';

import { ExpandableSection } from '@patternfly/react-core';

type ExpandSectionProps = {
  className?: string;
  toggleContent?: ReactNode;
  toggleText?: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({
  children,
  className,
  toggleContent = null,
  toggleText = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      className={className}
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
      toggleContent={toggleContent}
      toggleText={toggleText}
    >
      {children}
    </ExpandableSection>
  );
};

export default ExpandSection;
