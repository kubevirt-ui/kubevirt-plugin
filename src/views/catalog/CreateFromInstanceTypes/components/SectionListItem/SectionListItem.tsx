import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import classNames from 'classnames';

import { ListItem, Split, SplitItem } from '@patternfly/react-core';

import { INSTANCE_TYPES_SECTIONS } from '../../utils/constants';

type SectionListItemProps = {
  sectionKey: INSTANCE_TYPES_SECTIONS;
  headerText: string;
  sectionState: [INSTANCE_TYPES_SECTIONS, Dispatch<SetStateAction<INSTANCE_TYPES_SECTIONS>>];
  headerAction?: ReactNode;
};

const SectionListItem: FC<SectionListItemProps> = ({
  sectionKey,
  headerText,
  sectionState: [currentSection, setCurrentSection],
  headerAction,
  children,
}) => {
  const currentSectionClass = currentSection === sectionKey && 'current';
  return (
    <ListItem
      onClick={() => setCurrentSection(sectionKey)}
      className="create-vm-instance-type-section"
    >
      <Split className="create-vm-instance-type-section__add-volume-btn">
        <SplitItem
          className={classNames('create-vm-instance-type-section__step', currentSectionClass)}
        >
          {sectionKey}
        </SplitItem>
        <SplitItem
          className={classNames('create-vm-instance-type-section__header', currentSectionClass)}
        >
          {headerText}
        </SplitItem>
        {headerAction && (
          <>
            <SplitItem isFilled />
            <SplitItem>{headerAction}</SplitItem>
          </>
        )}
      </Split>
      {children}
    </ListItem>
  );
};

export default SectionListItem;
