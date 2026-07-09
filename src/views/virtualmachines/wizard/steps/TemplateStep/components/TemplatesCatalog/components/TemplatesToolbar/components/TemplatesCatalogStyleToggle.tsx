import React, { FC } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { ListIcon, ThIcon } from '@patternfly/react-icons';

type TemplatesCatalogStyleToggleProps = {
  isList: boolean;
  setIsList: (value: boolean) => void;
};

const TemplatesCatalogStyleToggle: FC<TemplatesCatalogStyleToggleProps> = ({
  isList,
  setIsList,
}) => {
  return (
    <ToggleGroup aria-label="list-or-grid-toggle" isCompact>
      <ToggleGroupItem
        aria-label="template list button"
        buttonId="template-list-btn"
        icon={<ListIcon />}
        isSelected={isList}
        onChange={() => setIsList(true)}
      />
      <ToggleGroupItem
        aria-label="template grid button"
        buttonId="template-grid-btn"
        icon={<ThIcon />}
        isSelected={!isList}
        onChange={() => setIsList(false)}
      />
    </ToggleGroup>
  );
};

export default TemplatesCatalogStyleToggle;
