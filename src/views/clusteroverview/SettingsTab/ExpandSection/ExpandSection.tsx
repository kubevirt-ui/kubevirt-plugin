import React, { FC, useState } from 'react';

import { ExpandableSection } from '@patternfly/react-core';

type ExpandSectionProps = {
  className?: string;
  toggleText: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({ children, className, toggleText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      className={className}
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
      toggleText={toggleText}
    >
      {children}
    </ExpandableSection>
  );
};

export default ExpandSection;
