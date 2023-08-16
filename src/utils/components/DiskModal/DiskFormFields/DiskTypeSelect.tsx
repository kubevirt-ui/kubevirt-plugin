import React, { Dispatch, FC, useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes, diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

type DiskTypeSelectProps = {
  diskType: string;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ diskType, dispatchDiskState, isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const typeOptions = Object.values(diskTypes).filter((type) => type !== diskTypes.floppy);

  const onSelectDiskSource = useCallback(
    (_event: React.MouseEvent<Element, MouseEvent>, selection: string) => {
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
          isDisabled={isVMRunning}
          isOpen={isOpen}
          menuAppendTo="parent"
          onSelect={onSelectDiskSource}
          onToggle={setIsOpen}
          selections={diskType}
          variant={SelectVariant.single}
        >
          {typeOptions.map((type) => (
            <SelectOption data-test-id={`disk-type-select-${type}`} key={type} value={type}>
              {diskTypesLabels[type]}
            </SelectOption>
          ))}
        </Select>
      </div>
    </FormGroup>
  );
};

export default DiskTypeSelect;
