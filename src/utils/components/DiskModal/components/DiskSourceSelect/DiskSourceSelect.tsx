import React, { FC } from 'react';
import classNames from 'classnames';

import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, SelectGroup } from '@patternfly/react-core';

import { SourceTypes } from '../../utils/types';

import DiskSourceOption from './components/DiskSourceOption/DiskSourceOption';
import { getAttachExistingGroupOptions, getBlankOption, getCDROMOption } from './utils/constants';

import './DiskSourceSelect.scss';

type DiskSourceSelectProps = {
  className?: string;
  onSelect: (value: SourceTypes) => void;
};

const DiskSourceSelect: FC<DiskSourceSelectProps> = ({ className, onSelect }) => {
  const { t } = useKubevirtTranslation();
  const attachExistingGroupOptions = getAttachExistingGroupOptions(t);
  return (
    <FormPFSelect
      className={classNames('disk-source-select', className)}
      onSelect={(_, val) => onSelect(val as SourceTypes)}
      selectedLabel={t('Add')}
      toggleProps={{ className: 'pf-v6-u-mb-sm', variant: 'primary' }}
    >
      <DiskSourceOption {...getBlankOption(t)} onSelect={onSelect} />
      <Divider component="li" />
      <SelectGroup
        className="disk-source-select__group-title"
        label={attachExistingGroupOptions.groupLabel}
      >
        {attachExistingGroupOptions.items.map((item) => (
          <DiskSourceOption key={item.id} {...item} onSelect={onSelect} />
        ))}
      </SelectGroup>
      <Divider component="li" />
      <DiskSourceOption {...getCDROMOption(t)} onSelect={onSelect} />
    </FormPFSelect>
  );
};

export default DiskSourceSelect;
