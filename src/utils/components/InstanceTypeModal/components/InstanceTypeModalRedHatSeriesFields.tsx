import type { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../../FormPFSelect/FormPFSelect';
import { type VisibleInstanceTypeSeriesEntry } from '../hooks/useVisibleInstanceTypeSeriesEntries';
import { type MappedInstanceTypes } from '../utils/types';
import { getInstanceTypeSizes } from '../utils/util';

type InstanceTypeModalRedHatSeriesFieldsProps = {
  mappedInstanceTypes: MappedInstanceTypes;
  series: string | undefined;
  setSeries: Dispatch<SetStateAction<string | undefined>>;
  setSize: Dispatch<SetStateAction<string | undefined>>;
  size: string | undefined;
  visibleSeriesEntries: VisibleInstanceTypeSeriesEntry[];
};

const InstanceTypeModalRedHatSeriesFields: FC<InstanceTypeModalRedHatSeriesFieldsProps> = ({
  mappedInstanceTypes,
  series,
  setSeries,
  setSize,
  size,
  visibleSeriesEntries,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup isRequired label={t('Series')}>
        <FormPFSelect
          onSelect={(_event, value): void => {
            if (value !== series) {
              setSeries(value as string);
              setSize(undefined);
            }
          }}
          placeholder={t('Select series')}
          selected={series}
          toggleProps={{ isFullWidth: true }}
        >
          {visibleSeriesEntries.map(([key, value]) => (
            <SelectOption
              description={value.descriptionSeries}
              key={key}
              value={value.displayNameSeries}
            >
              {value.displayNameSeries}
            </SelectOption>
          ))}
        </FormPFSelect>
      </FormGroup>
      <FormGroup isRequired label={t('Size')}>
        <FormPFSelect
          onSelect={(_event, value): void => {
            setSize(value as string);
          }}
          placeholder={t('Select size')}
          selected={size}
          toggleProps={{ isFullWidth: true }}
        >
          {getInstanceTypeSizes(mappedInstanceTypes, series)?.map((item) => (
            <SelectOption key={item.prettyDisplaySize} value={item.prettyDisplaySize}>
              {item.prettyDisplaySize}
            </SelectOption>
          ))}
        </FormPFSelect>
      </FormGroup>
    </>
  );
};

export default InstanceTypeModalRedHatSeriesFields;
