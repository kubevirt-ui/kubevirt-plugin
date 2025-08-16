import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import DateFromToPicker from '../components/DateFromToPicker';
import DateSelect from '../components/DateSelect';
import { DateSelectOption } from '../constants/dateSelect';
import { useAdvancedSearchField } from '../store/useAdvancedSearchStore';

const DateCreatedField: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setValue: setDateFromString, value: dateFromString } = useAdvancedSearchField(
    VirtualMachineRowFilterType.DateCreatedFrom,
  );
  const { setValue: setDateToString, value: dateToString } = useAdvancedSearchField(
    VirtualMachineRowFilterType.DateCreatedTo,
  );
  const { setValue: setDateOption, value: dateOption } = useAdvancedSearchField('dateOption');

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
          />
        </div>
      )}
    </FormGroup>
  );
};

export default DateCreatedField;
