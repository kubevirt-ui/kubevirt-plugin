import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DatePicker, DatePickerProps, Split, SplitItem } from '@patternfly/react-core';

import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

type DateFromToPickerProps = {
  'data-test'?: string;
  dateFromString: string;
  dateToString: string;
  setDateFromString: Dispatch<SetStateAction<string>>;
  setDateToString: Dispatch<SetStateAction<string>>;
};

const DateFromToPicker: FC<DateFromToPickerProps> = ({
  'data-test': dataTest,
  dateFromString,
  dateToString,
  setDateFromString,
  setDateToString,
}) => {
  const { t } = useKubevirtTranslation();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const { setValue: setIsValidDate } = useAdvancedSearchField('isValidDate');

  useEffect(() => {
    if ((dateFromString && !dateFrom) || (dateToString && !dateTo) || dateFrom > dateTo) {
      setIsValidDate(false);
    } else {
      setIsValidDate(true);
    }
  }, [dateFrom, dateTo, dateFromString, dateToString, setIsValidDate]);

  const onDateChange: (
    setDateString: (dateString: string) => void,
    setDate: (date: Date) => void,
  ) => DatePickerProps['onChange'] = (setDateString, setDate) => (_, dateString, date) => {
    if (date) {
      setDateString(dateString);
      setDate(date);
      return;
    }

    setDateString(dateString);
    setDate(undefined);
  };

  return (
    <Split>
      <DatePicker
        data-test={dataTest && `${dataTest}-from`}
        onChange={onDateChange(setDateFromString, setDateFrom)}
        placeholder={t('From')}
        value={dateFromString}
      />
      <SplitItem className="pf-v6-u-pt-sm pf-v6-u-px-md">{t('to')}</SplitItem>
      <DatePicker
        data-test={dataTest && `${dataTest}-to`}
        onChange={onDateChange(setDateToString, setDateTo)}
        placeholder={t('To')}
        validators={[(date) => (date < dateFrom ? t('Date To cannot be before Date From') : '')]}
        value={dateToString}
      />
    </Split>
  );
};

export default DateFromToPicker;
