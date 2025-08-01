import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getSelectDataTestProps } from '@kubevirt-utils/utils/selectDataTest';
import { yyyyMMddFormat } from '@patternfly/react-core';
import { SimpleSelect, SimpleSelectOption } from '@patternfly/react-templates';

import {
  DateSelectOption,
  dateSelectOptions,
  dateSelectOptionsInfo,
} from '../constants/dateSelect';

type DateSelectProps = {
  'data-test'?: string;
  onSelect: (value: DateSelectOption) => void;
  selected: DateSelectOption;
  setDateFromString: (date: string) => void;
  setDateToString: (date: string) => void;
};

const DateSelect: FC<DateSelectProps> = ({
  'data-test': dataTest,
  onSelect,
  selected,
  setDateFromString,
  setDateToString,
}) => {
  const { t } = useKubevirtTranslation();

  const initialOptions = useMemo<SimpleSelectOption[]>(
    () =>
      Object.values(dateSelectOptions).map((option) => ({
        content: dateSelectOptionsInfo[option].label,
        selected: option === selected,
        value: option,
      })),
    [selected],
  );

  return (
    <SimpleSelect
      onSelect={(_, selection: DateSelectOption) => {
        onSelect(selection);

        if (selection === DateSelectOption.Custom) {
          setDateFromString('');
          setDateToString('');
          return;
        }

        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - dateSelectOptionsInfo[selection].daysBack);

        setDateFromString(yyyyMMddFormat(dateFrom));

        if (selection === DateSelectOption.Yesterday) {
          setDateToString(yyyyMMddFormat(new Date()));
        }
      }}
      initialOptions={initialOptions}
      placeholder={t('Any time')}
      toggleWidth="100%"
      {...getSelectDataTestProps(dataTest)}
    />
  );
};

export default DateSelect;
