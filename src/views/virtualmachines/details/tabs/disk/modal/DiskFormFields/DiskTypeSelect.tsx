import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes, diskTypesLabels } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions } from '../reducer/actions';

type DiskTypeSelectProps = {
  diskType: string;
  dispatch: React.Dispatch<any>;
  isVMRunning?: boolean;
};

const DiskTypeSelect: React.FC<DiskTypeSelectProps> = ({ diskType, dispatch, isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const typeOptions = Object.values(diskTypes).filter((type) => type !== diskTypes.floppy);

  const onSelectDiskSource = React.useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, selection: string) => {
      dispatch({ type: diskReducerActions.SET_DISK_TYPE, payload: selection });
      setIsOpen(false);
    },
    [dispatch],
  );
  return (
    <FormGroup
      fieldId="disk-source-type-select"
      label={t('Type')}
      helperText={t('Hot plug is enabled only for "Disk" type')}
    >
      <Select
        menuAppendTo="parent"
        isOpen={isOpen}
        onToggle={setIsOpen}
        onSelect={onSelectDiskSource}
        variant={SelectVariant.single}
        selections={diskType}
      >
        {typeOptions.map((type) => (
          <SelectOption key={type} value={type} isDisabled={isVMRunning && type !== diskTypes.disk}>
            {diskTypesLabels[type]}
          </SelectOption>
        ))}
      </Select>
    </FormGroup>
  );
};

export default DiskTypeSelect;
