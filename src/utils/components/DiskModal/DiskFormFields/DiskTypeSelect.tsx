import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes, diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type DiskTypeSelectProps = {
  diskType: string;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isVMRunning?: boolean;
};

const DiskTypeSelect: React.FC<DiskTypeSelectProps> = ({
  diskType,
  dispatchDiskState,
  isVMRunning,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const typeOptions = Object.values(diskTypes).filter((type) => type !== diskTypes.floppy);

  const onSelectDiskSource = React.useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, selection: string) => {
      dispatchDiskState({ payload: selection, type: diskReducerActions.SET_DISK_TYPE });
      setIsOpen(false);
    },
    [dispatchDiskState],
  );
  return (
    <FormGroup
      fieldId="disk-source-type-select"
      helperText={t('Hot plug is enabled only for "Disk" type')}
      label={t('Type')}
    >
      <div data-test-id="disk-type-select">
        <Select
          isOpen={isOpen}
          menuAppendTo="parent"
          onSelect={onSelectDiskSource}
          onToggle={setIsOpen}
          selections={diskType}
          variant={SelectVariant.single}
        >
          {typeOptions.map((type) => (
            <SelectOption
              data-test-id={`disk-type-select-${type}`}
              isDisabled={isVMRunning && type !== diskTypes.disk}
              key={type}
              value={type}
            >
              {diskTypesLabels[type]}
            </SelectOption>
          ))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default DiskTypeSelect;
