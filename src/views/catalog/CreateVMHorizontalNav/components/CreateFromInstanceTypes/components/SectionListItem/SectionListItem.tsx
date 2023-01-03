import React, { FC } from 'react';
import classNames from 'classnames';

import { INSTANCE_TYPES_SECTIONS } from '@catalog/CreateVMHorizontalNav/components/CreateFromInstanceTypes/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, ListItem, Split, SplitItem } from '@patternfly/react-core';

type SectionListItemProps = {
  sectionKey: INSTANCE_TYPES_SECTIONS;
  headerText: string;
  sectionState: [
    INSTANCE_TYPES_SECTIONS,
    React.Dispatch<React.SetStateAction<INSTANCE_TYPES_SECTIONS>>,
  ];
};

const SectionListItem: FC<SectionListItemProps> = ({
  sectionKey,
  headerText,
  sectionState: [currentSection, setCurrentSection],
  children,
}) => {
  const { t } = useKubevirtTranslation();
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
        {sectionKey === INSTANCE_TYPES_SECTIONS.SELECT_VOLUME && (
          <>
            <SplitItem isFilled />
            <SplitItem>
              <Button variant={ButtonVariant.secondary}>{t('Add bootable Volume')}</Button>
            </SplitItem>
          </>
        )}
      </Split>
      {children}
    </ListItem>
  );
};

export default SectionListItem;
