import { type FC, type ReactElement, type Ref, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
  Tooltip,
} from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';

type ExportTableDropdownProps = {
  allCount: number;
  asToolbarItem?: boolean;
  disabled: boolean;
  onExportAll: () => void;
  onExportSelected: () => void;
  selectedCount: number;
  tooltipContent: string;
};

const ExportTableDropdown: FC<ExportTableDropdownProps> = ({
  allCount,
  asToolbarItem = false,
  disabled,
  onExportAll,
  onExportSelected,
  selectedCount,
  tooltipContent,
}): ReactElement => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = (): void => {
    if (disabled) {
      return;
    }
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={() => setIsOpen(false)}
      popperProps={{ position: 'end' }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <Tooltip content={tooltipContent} trigger="mouseenter focus">
          <MenuToggle
            aria-disabled={disabled}
            aria-label={t('Export table data to CSV')}
            className={asToolbarItem ? undefined : 'kubevirt-table-toolbar-action'}
            data-test="export-table-csv"
            isExpanded={isOpen}
            onClick={onToggle}
            ref={toggleRef}
            variant="plain"
          >
            <ExportIcon />
          </MenuToggle>
        </Tooltip>
      )}
    >
      <DropdownList>
        <DropdownItem
          data-test="export-table-csv-selected"
          key="selected"
          onClick={onExportSelected}
        >
          {t('Export selected ({{count}})', { count: selectedCount })}
        </DropdownItem>
        <DropdownItem data-test="export-table-csv-all" key="all" onClick={onExportAll}>
          {t('Export all ({{count}})', { count: allCount })}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default ExportTableDropdown;
