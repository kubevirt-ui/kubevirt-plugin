import type { FC, RefObject } from 'react';

import { Divider } from '@patternfly/react-core';

import Filter from './Filter';
import ShowSystemNamespacesSwitch from './ShowSystemNamespacesSwitch';
import type { DropdownConfig, ShowSystemToggle } from './types';

type DropdownMenuFilterSectionProps = {
  config: DropdownConfig;
  filterRef: RefObject<HTMLInputElement>;
  filterText: string;
  onFilterChange: (text: string) => void;
  showSystemToggle?: ShowSystemToggle;
};

const DropdownMenuFilterSection: FC<DropdownMenuFilterSectionProps> = ({
  config,
  filterRef,
  filterText,
  onFilterChange,
  showSystemToggle,
}) => (
  <>
    <div className={`${config.cssPrefix}__search-wrapper`}>
      <Filter
        config={config}
        filterRef={filterRef}
        filterText={filterText}
        onFilterChange={onFilterChange}
      />
    </div>
    <Divider />
    {showSystemToggle && (
      <>
        <ShowSystemNamespacesSwitch
          hasSystemNamespaces={showSystemToggle.hasSystemItems}
          isChecked={showSystemToggle.show}
          onChange={showSystemToggle.onChange}
        />
        <Divider />
      </>
    )}
  </>
);

export default DropdownMenuFilterSection;
