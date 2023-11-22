import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import classNames from 'classnames';

import { ListItem, Split, SplitItem } from '@patternfly/react-core';

import { INSTANCE_TYPES_SECTIONS } from '../../utils/constants';

type SectionListItemProps = {
  headerAction?: ReactNode;
  headerText: ReactNode;
  sectionKey: INSTANCE_TYPES_SECTIONS;
  sectionState: [INSTANCE_TYPES_SECTIONS, Dispatch<SetStateAction<INSTANCE_TYPES_SECTIONS>>];
};

const SectionListItem: FC<SectionListItemProps> = ({
  children,
  headerAction,
  headerText,
  sectionKey,
  sectionState: [currentSection, setCurrentSection],
}) => {
  const currentSectionClass = currentSection === sectionKey && 'current';
  return (
    <ListItem
      className="create-vm-instance-type-section"
      onClick={() => setCurrentSection(sectionKey)}
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
