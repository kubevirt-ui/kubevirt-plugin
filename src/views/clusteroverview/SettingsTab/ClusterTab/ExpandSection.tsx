import React, { FC, useState } from 'react';

import { ExpandableSection } from '@patternfly/react-core';

type ExpandSectionProps = {
  toggleText: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({ children, toggleText }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection isExpanded={isExpanded} onToggle={setIsExpanded} toggleText={toggleText}>
      {children}
    </ExpandableSection>
  );
};

export default ExpandSection;
