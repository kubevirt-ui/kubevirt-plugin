import { FC, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

import useIsExpandedAndHighlighted from '@overview/SettingsTab/ExpandSection/hooks/useIsExpandedAndHighlighted';
import {
  ExpandableSection,
  ExpandableSectionToggle,
  PopoverPosition,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

import './ExpandSectionWithCustomToggle.scss';

type ExpandSectionWithCustomToggleProps = {
  children?: ReactNode;
  className?: string;
  customContent?: ReactNode;
  expandSectionClassName?: string;
  helpTextContent?: ReactNode;
  id: string;
  isExpanded?: boolean;
  isIndented?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  searchItemId?: string;
  toggleClassname?: string;
  toggleContent: ReactNode;
};

const ExpandSectionWithCustomToggle: FC<ExpandSectionWithCustomToggleProps> = ({
  children,
  className,
  customContent,
  expandSectionClassName = '',
  helpTextContent,
  id,
  isExpanded: controlledIsExpanded,
  isIndented = false,
  onToggle: controlledOnToggle,
  searchItemId,
  toggleClassname = '',
  toggleContent,
}) => {
  const {
    isExpanded: internalIsExpanded,
    isHighlighted,
    setIsExpanded,
  } = useIsExpandedAndHighlighted(searchItemId);

  const isExpanded = controlledIsExpanded ?? internalIsExpanded;
  const onToggle = controlledOnToggle ?? setIsExpanded;

  const toggleID = `${id}--toggle`;
  const contentID = `${id}--content`;

  return (
    <Stack className={classNames('expand-section-custom-toggle', className)}>
      <StackItem
        className={classNames({
          'expand-section-custom-toggle__toggle-container--expanded': isExpanded,
        })}
      >
        <Split>
          <SplitItem isFilled>
            <ExpandableSectionToggle
              className={classNames(toggleClassname, { isHighlighted })}
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
          className={classNames(
            'expand-section-custom-toggle__expandable-section',
            'ExpandSection',
            expandSectionClassName,
          )}
          contentId={contentID}
          isDetached
          isExpanded={isExpanded}
          isIndented={isIndented}
          toggleId={toggleID}
        >
          {isExpanded && children}
        </ExpandableSection>
      </StackItem>
    </Stack>
  );
};

export default ExpandSectionWithCustomToggle;
