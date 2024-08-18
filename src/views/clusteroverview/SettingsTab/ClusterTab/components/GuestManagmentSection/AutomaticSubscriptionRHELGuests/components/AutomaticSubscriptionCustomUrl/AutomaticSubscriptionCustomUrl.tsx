import React, { FC, useEffect, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { debounce } from '@kubevirt-utils/utils/debounce';
import { Checkbox, Flex, Popover, PopoverPosition, Text, TextInput } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './automatic-subscription-custom-url.scss';

type AutomaticSubscriptionCustomUrlProps = {
  customUrl: string;
  isDisabled: boolean;
  updateCustomUrl: (data: Partial<RHELAutomaticSubscriptionData>) => void;
};

const AutomaticSubscriptionCustomUrl: FC<AutomaticSubscriptionCustomUrlProps> = ({
  customUrl,
  isDisabled,
  updateCustomUrl,
}) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(!!customUrl);
  const [inputValue, setInputValue] = useState<string>();
  const debounceUpdateCustomUrl = useMemo(() => debounce(updateCustomUrl, 500), [updateCustomUrl]);

  useEffect(() => {
    setInputValue(customUrl);
  }, [customUrl]);

  return (
    <div className="AutomaticSubscriptionCustomUrl--main">
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <Checkbox
          onChange={() =>
            setIsChecked((prevIsChecked) => {
              if (prevIsChecked) debounceUpdateCustomUrl({ customUrl: '' });
              return !prevIsChecked;
            })
          }
          className="AutomaticSubscriptionCustomUrl--checkbox"
          id="auto-register-rhel"
          isChecked={isChecked && !isDisabled}
          isDisabled={isDisabled}
          label={t('Use custom registration server url')}
        />
        <Popover
          aria-label={'Help'}
          bodyContent={t('Select this option if you use an on-premise subscription service')}
          position={PopoverPosition.right}
        >
          <HelpIcon />
        </Popover>
      </Flex>
      {isChecked && !isDisabled && (
        <Flex>
          <Text>URL</Text>
          <TextInput
            onChange={(_, value: string) => {
              setInputValue(value);
              debounceUpdateCustomUrl({ customUrl: value });
            }}
            className="AutomaticSubscriptionCustomUrl--input"
            value={inputValue}
          />
        </Flex>
      )}
    </div>
  );
};

export default AutomaticSubscriptionCustomUrl;
