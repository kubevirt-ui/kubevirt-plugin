import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

import DateFromToPicker from '../components/DateFromToPicker';
import DateSelect from '../components/DateSelect';
import { DateSelectOption } from '../constants/dateSelect';

type DateCreatedFieldProps = {
  dateFromString: string;
  dateOption?: DateSelectOption;
  dateToString: string;
  setDateFromString: (date: string) => void;
  setDateOption: (option: DateSelectOption) => void;
  setDateToString: (date: string) => void;
  setIsValidDate: (isValid: boolean) => void;
};

const DateCreatedField: FC<DateCreatedFieldProps> = ({
  dateFromString,
  dateOption,
  dateToString,
  setDateFromString,
  setDateOption,
  setDateToString,
  setIsValidDate,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup label={t('Date created')}>
      <DateSelect
        data-test="adv-search-date-select"
        onSelect={(option) => setDateOption(option)}
        selected={dateOption}
        setDateFromString={setDateFromString}
        setDateToString={setDateToString}
      />
      {dateOption === DateSelectOption.Custom && (
        <div className="pf-v6-u-mt-sm">
          <DateFromToPicker
            data-test="adv-search-date"
            dateFromString={dateFromString}
            dateToString={dateToString}
            setDateFromString={setDateFromString}
            setDateToString={setDateToString}
            setIsValidDate={setIsValidDate}
          />
        </div>
      )}
    </FormGroup>
  );
};

export default DateCreatedField;
