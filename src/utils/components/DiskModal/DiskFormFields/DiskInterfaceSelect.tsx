import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';
import { DiskFormState } from '../state/initialState';

import { interfaceTypes } from './utils/constants';
import { getInterfaceOptions } from './utils/helpers';

type DiskInterfaceSelectProps = {
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isVMRunning: boolean;
};

const DiskInterfaceSelect: React.FC<DiskInterfaceSelectProps> = ({
  diskState,
  dispatchDiskState,
  isVMRunning,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskInterface, diskType } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const interfaceOptions = React.useMemo(() => Object.values(getInterfaceOptions(t)), [t]);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    setIsOpen(false);
    dispatchDiskState({ type: diskReducerActions.SET_DISK_INTERFACE, payload: value });
  };

  React.useEffect(() => {
    // only SCSI is supported for hotplug
    if (isVMRunning && diskInterface !== interfaceTypes.SCSI) {
      dispatchDiskState({
        type: diskReducerActions.SET_DISK_INTERFACE,
        payload: interfaceTypes.SCSI,
      });
    }
  }, [dispatchDiskState, isVMRunning, diskInterface]);

  React.useEffect(() => {
    // virtio is not supported for CDROM
    if (isCDROMType && diskInterface === interfaceTypes.VIRTIO) {
      dispatchDiskState({
        type: diskReducerActions.SET_DISK_INTERFACE,
        payload: interfaceTypes.SATA,
      });
    }
  }, [diskInterface, dispatchDiskState, isCDROMType]);
  return (
    <>
      <FormGroup
        label={t('Interface')}
        fieldId="disk-interface"
        helperText={t('Hot plug is enabled only for "SCSI" interface')}
        isRequired
      >
        <div data-test-id="disk-interface-select">
          <Select
            menuAppendTo="parent"
            isOpen={isOpen}
            onToggle={setIsOpen}
            onSelect={onSelect}
            variant={SelectVariant.single}
            selections={diskInterface}
            direction="up"
          >
            {interfaceOptions.map(({ id, description, name }) => {
              const isDisabled =
                (isVMRunning && id !== interfaceTypes.SCSI) ||
                (isCDROMType && id === interfaceTypes.VIRTIO);
              return (
                <SelectOption
                  key={id}
                  value={id}
                  description={description}
                  isDisabled={isDisabled}
                  data-test-id={`disk-interface-select-${id}`}
                >
                  {name}
                </SelectOption>
              );
            })}
          </Select>
        </div>
      </FormGroup>
    </>
  );
};

export default DiskInterfaceSelect;
