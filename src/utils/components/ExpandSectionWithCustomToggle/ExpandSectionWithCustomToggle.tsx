import React, { FC, ReactNode, useState } from 'react';
import classNames from 'classnames';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import {
  ExpandableSection,
  ExpandableSectionToggle,
  PopoverPosition,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './ExpandSectionWithCustomToggle.scss';

type ExpandSectionWithCustomToggleProps = {
  children?: ReactNode;
  className?: string;
  customContent?: ReactNode;
  helpTextContent?: ReactNode;
  id: string;
  toggleContent: ReactNode;
};

const ExpandSectionWithCustomToggle: FC<ExpandSectionWithCustomToggleProps> = ({
  children,
  className,
  customContent,
  helpTextContent,
  id,
  toggleContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleID = `${id}--toggle`;
  const contentID = `${id}--content`;

  const onToggle = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return (
    <Stack className={classNames('expand-section-custom-toggle', className)} hasGutter>
      <StackItem>
        <Split>
          <SplitItem isFilled>
            <ExpandableSectionToggle
              contentId={contentID}
              isExpanded={isExpanded}
              onToggle={onToggle}
              toggleId={toggleID}
            >
              {toggleContent}
            </ExpandableSectionToggle>
          </SplitItem>
          {helpTextContent && (
            <SplitItem className="expand-section-custom-toggle__help-icon-container" isFilled>
              <HelpTextIcon
                bodyContent={helpTextContent}
                helpIconClassName="expand-section-custom-toggle__help-icon"
                position={PopoverPosition.right}
              />
            </SplitItem>
          )}
          {customContent && (
            <SplitItem className="expand-section-custom-toggle__custom-content" isFilled>
              {customContent}
            </SplitItem>
          )}
        </Split>
      </StackItem>
      <StackItem>
        <ExpandableSection
          className="expand-section-custom-toggle__expandable-section"
          contentId={contentID}
          isDetached
          isExpanded={isExpanded}
          isIndented
          toggleId={toggleID}
        >
          {children}
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default ExpandSectionWithCustomToggle;
