import React, { FC, ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames';

import { ExpandableSection } from '@patternfly/react-core';

import './ExpandSection.scss';

type ExpandSectionProps = {
  className?: string;
  isDisabled?: boolean;
  isIndented?: boolean;
  toggleContent?: ReactNode;
  toggleText?: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({
  children,
  className,
  isDisabled = false,
  isIndented = true,
  toggleContent = null,
  toggleText = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isDisabled) setIsExpanded(false);
  }, [isDisabled, setIsExpanded]);

  const handleToggle = (expanded: boolean) => (isDisabled ? null : setIsExpanded(expanded));

  return (
    <ExpandableSection
      className={classNames(className, { 'expand-section__disabled': isDisabled }, 'ExpandSection')}
      isExpanded={isExpanded}
      isIndented={isIndented}
      onToggle={(_event, expanded: boolean) => handleToggle(expanded)}
      toggleContent={toggleContent}
      toggleText={toggleText}
    >
      {children}
    </ExpandableSection>
  );
};

export default ExpandSection;
