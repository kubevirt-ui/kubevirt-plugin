import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DiskType,
  diskTypes,
  diskTypesLabels,
} from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { FormGroup, SelectList, SelectOption } from '@patternfly/react-core';

import { getSourceFromVolume } from '../../utils/helpers';
import { InterfaceTypes, SourceTypes, V1DiskFormState } from '../../utils/types';
import { getDiskTypeHelperText } from '../DiskInterfaceSelect/utils/util';
import { DISKTYPE_SELECT_FIELDID } from '../utils/constants';

type DiskTypeSelectProps = {
  isVMRunning?: boolean;
};

const DiskTypeSelect: FC<DiskTypeSelectProps> = ({ isVMRunning }) => {
  const { t } = useKubevirtTranslation();
  const { setValue, watch } = useFormContext<V1DiskFormState>();

  const diskState = watch();

  if (!diskState) return null;

  const diskType = getDiskDrive(diskState.disk);
  const isCDROM = diskType === diskTypes.cdrom;

  const diskSource = getSourceFromVolume(diskState.volume, diskState.dataVolumeTemplate);

  const shouldDisableOption = (optionType: DiskType): boolean => {
    return optionType === diskTypes.cdrom && isVMRunning && diskSource !== SourceTypes.CDROM;
  };

  const diskInterface = diskState.disk?.[diskType]?.bus || InterfaceTypes.VIRTIO;

  const userHelpText = getDiskTypeHelperText(diskState.disk, isVMRunning);

  return (
    <div data-test-id={DISKTYPE_SELECT_FIELDID}>
      <FormGroup fieldId={DISKTYPE_SELECT_FIELDID} label={t('Type')}>
        <FormPFSelect
          onSelect={(_, val) => {
            setValue('disk.cdrom', null);
            setValue('disk.lun', null);
            setValue('disk.disk', null);

            //cd-rom doesn't support virtio and LUN only supports SCSI
            const newDiskInterface =
              (val === diskTypes.cdrom && diskInterface === InterfaceTypes.VIRTIO) ||
              (val === diskTypes.lun && diskInterface !== InterfaceTypes.SCSI)
                ? InterfaceTypes.SCSI
                : diskInterface;

            setValue(`disk.${val as DiskType}`, { bus: newDiskInterface });
          }}
          isDisabled={isCDROM}
          selected={diskType}
          selectedLabel={diskTypesLabels[diskType]}
          toggleProps={{ isFullWidth: true }}
        >
          <SelectList>
            {Object.values(diskTypes).map((type) => (
              <SelectOption
                data-test-id={`${DISKTYPE_SELECT_FIELDID}-${type}`}
                isDisabled={shouldDisableOption(type)}
                key={type}
                value={type}
              >
                {diskTypesLabels[type]}
              </SelectOption>
            ))}
          </SelectList>
        </FormPFSelect>
        <FormGroupHelperText>{userHelpText}</FormGroupHelperText>
      </FormGroup>
    </div>
  );
};

export default DiskTypeSelect;
