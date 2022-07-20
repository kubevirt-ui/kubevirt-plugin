import * as React from 'react';

import {
  DEFAULT_DURATION_KEY,
  DURATION_VALUES,
  DurationKeys,
} from '@kubevirt-utils/components/Charts/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

export type TimeDropdownProps = {
  setDuration: React.Dispatch<React.SetStateAction<number>>;
};

const TimeDropdown: React.FC<TimeDropdownProps> = ({ setDuration }) => {
  const [isOpen, setOpen] = React.useState(false);
  const [selectedKey, setSelectedKey] = React.useState(DEFAULT_DURATION_KEY);
  const { t } = useKubevirtTranslation();

  const items = {
    [DurationKeys.FiveMinutes]: t('5 minutes'),
    [DurationKeys.OneHour]: t('1 hour'),
    [DurationKeys.SixHours]: t('6 hours'),
    [DurationKeys.TwentyFourHours]: t('24 hours'),
  };

  const onSelect = React.useCallback(
    (event, newSelected) => {
      setSelectedKey(newSelected);
      setDuration(DURATION_VALUES[newSelected]);
      setOpen(false);
    },
    [setDuration],
  );

  return (
    <div className="duration-select" data-test-id="duration-select">
      <Select
        variant={SelectVariant.single}
        onToggle={setOpen}
        onSelect={onSelect}
        selections={selectedKey}
        isOpen={isOpen}
        isPlain
      >
        {Object.keys(items).map((key) => (
          <SelectOption key={key} value={key}>
            {items[key]}
          </SelectOption>
        ))}
      </Select>
    </div>
  );
};

export default TimeDropdown;
