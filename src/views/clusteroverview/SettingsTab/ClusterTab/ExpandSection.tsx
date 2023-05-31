import React, { FC, useState } from 'react';

import { ExpandableSection } from '@patternfly/react-core';

type ExpandSectionProps = {
  toggleText: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({ toggleText, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection toggleText={toggleText} isExpanded={isExpanded} onToggle={setIsExpanded}>
      {children}
    </ExpandableSection>
  );
};

export default ExpandSection;
