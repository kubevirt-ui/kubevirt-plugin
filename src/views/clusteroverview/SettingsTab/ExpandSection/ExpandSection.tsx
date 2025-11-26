import React, { FC, ReactNode, useEffect } from 'react';
import classNames from 'classnames';

import { ExpandableSection } from '@patternfly/react-core';

import useIsExpandedAndHighlighted from './hooks/useIsExpandedAndHighlighted';

import './ExpandSection.scss';

type ExpandSectionProps = {
  className?: string;
  dataTestID?: string;
  isDisabled?: boolean;
  isIndented?: boolean;
  searchItemId?: string;
  toggleContent?: ReactNode;
  toggleText?: string;
};

const ExpandSection: FC<ExpandSectionProps> = ({
  children,
  className,
  dataTestID,
  isDisabled = false,
  isIndented = true,
  searchItemId,
  toggleContent = null,
  toggleText = '',
}) => {
  const { isExpanded, isHighlighted, setIsExpanded } = useIsExpandedAndHighlighted(searchItemId);

  useEffect(() => {
    if (isDisabled) setIsExpanded(false);
  }, [isDisabled, setIsExpanded]);

  const handleToggle = (expanded: boolean) => (isDisabled ? null : setIsExpanded(expanded));

  return (
    <ExpandableSection
      className={classNames(
        className,
        { 'expand-section__disabled': isDisabled, isHighlighted },
        'ExpandSection',
      )}
      data-test-id={dataTestID}
      isExpanded={isExpanded}
      isIndented={isIndented}
      onToggle={(_event, expanded: boolean) => handleToggle(expanded)}
      toggleContent={toggleContent}
      toggleText={toggleText}
    >
      {isExpanded && children}
    </ExpandableSection>
  );
};

export default ExpandSection;
