import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DatePicker, DatePickerProps, Split, SplitItem } from '@patternfly/react-core';

type DateFromToPickerProps = {
  dateFromString: string;
  dateToString: string;
  setDateFromString: Dispatch<SetStateAction<string>>;
  setDateToString: Dispatch<SetStateAction<string>>;
  setIsValidDate: Dispatch<SetStateAction<boolean>>;
};

const DateFromToPicker: FC<DateFromToPickerProps> = ({
  dateFromString,
  dateToString,
  setDateFromString,
  setDateToString,
  setIsValidDate,
}) => {
  const { t } = useKubevirtTranslation();
  const [dateFrom, setDateFrom] = useState<Date>();

  const onDateChange: (
    setDateString: (dateString: string) => void,
    setDate?: (date: Date) => void,
  ) => DatePickerProps['onChange'] = (setDateString, setDate) => (_, dateString, date) => {
    if (date) {
      setDateString(dateString);
      setDate?.(date);
      return;
    }

    setDateString('');
    setDate?.(undefined);
  };

  return (
    <Split>
      <DatePicker
        onChange={onDateChange(setDateFromString, setDateFrom)}
        placeholder={t('From')}
        value={dateFromString}
      />
      <SplitItem className="pf-v6-u-pt-sm pf-v6-u-px-md">{t('to')}</SplitItem>
      <DatePicker
        validators={[
          (date) => {
            if (date < dateFrom) {
              setIsValidDate(false);
              return t('Date To cannot be before Date From');
            }
            setIsValidDate(true);
            return '';
          },
        ]}
        onChange={onDateChange(setDateToString)}
        placeholder={t('To')}
        value={dateToString}
      />
    </Split>
  );
};

export default DateFromToPicker;
