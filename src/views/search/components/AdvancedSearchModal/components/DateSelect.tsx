import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

import { DateSelectOption, dateSelectOptions, getDateSelectLabels } from '../constants/dateSelect';

type DateSelectProps = {
  'data-test'?: string;
  onSelect: (value: DateSelectOption) => void;
  selected: DateSelectOption;
  setDateCreated: (value: string) => void;
  setDateFromString: (date: string) => void;
  setDateToString: (date: string) => void;
};

const DateSelect: FC<DateSelectProps> = ({
  'data-test': dataTest,
  onSelect,
  selected,
  setDateCreated,
  setDateFromString,
  setDateToString,
}) => {
  const { t } = useKubevirtTranslation();

  const labels = getDateSelectLabels(t);

  const initialOptions = useMemo<SimpleSelectOption[]>(
    () =>
      dateSelectOptions.map((option) => ({
        content: labels[option],
        selected: option === selected,
        value: option,
      })),
    [labels, selected],
  );

  return (
    <SimpleSelect
      onSelect={(_, selection: DateSelectOption) => {
        onSelect(selection);

        if (selection === DateSelectOption.Custom) {
          setDateCreated('');
          setDateFromString('');
          setDateToString('');
          return;
        }

        setDateCreated(selection);
        setDateFromString('');
        setDateToString('');
      }}
      initialOptions={initialOptions}
      placeholder={t('Any time')}
      toggleWidth="100%"
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default DateSelect;
