import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import { InterfaceTypes, V1DiskFormState } from '../../utils/types';

import { diskInterfaceOptions } from './utils/constants';
import { getInterfaceTypeHelperText } from './utils/util';

type DiskInterfaceSelectProps = {
  isVMRunning: boolean;
};

const DiskInterfaceSelect: FC<DiskInterfaceSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();
  const disk = watch('disk');

  const diskType = getDiskDrive(disk);

  const diskInterface = disk?.[diskType]?.bus || InterfaceTypes.VIRTIO;

  const selectedLabel = diskInterfaceOptions?.[diskInterface]?.label;

  const userHelpText = getInterfaceTypeHelperText(disk, isVMRunning);

  return (
    <FormGroup fieldId="disk-interface" isRequired label={t('Interface')}>
      <div data-test-id="disk-interface-select">
        <FormPFSelect
          onSelect={(_, val) => setValue(`disk.${diskType}.bus`, val as string)}
          selected={diskInterface}
          selectedLabel={selectedLabel}
          toggleProps={{ isFullWidth: true }}
        >
          {Object.entries(diskInterfaceOptions).map(([id, { description, label }]) => {
            const isDisabled =
              (diskType === diskTypes.cdrom && id === InterfaceTypes.VIRTIO) ||
              (diskType === diskTypes.lun && id !== InterfaceTypes.SCSI) ||
              (isVMRunning && id === InterfaceTypes.SATA);
            return (
              <SelectOption
                data-test-id={`disk-interface-select-${id}`}
                description={description}
                isDisabled={isDisabled}
                key={id}
                value={id}
              >
                {label}
              </SelectOption>
            );
          })}
        </FormPFSelect>
        <FormGroupHelperText>{userHelpText}</FormGroupHelperText>
      </div>
    </FormGroup>
  );
};

export default DiskInterfaceSelect;
