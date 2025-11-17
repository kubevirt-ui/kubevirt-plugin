import React, { FC, useCallback, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { AUTOMATIC_SUBSCRIPTION_CUSTOM_URL } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { debounce } from '@kubevirt-utils/utils/debounce';
import {
  Checkbox,
  Content,
  Flex,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './automatic-subscription-custom-url.scss';

type AutomaticSubscriptionCustomUrlProps = {
  customUrl: string;
  isDisabled?: boolean;
};

const AutomaticSubscriptionCustomUrl: FC<AutomaticSubscriptionCustomUrlProps> = ({
  customUrl,
  isDisabled,
}) => {
  const { t } = useKubevirtTranslation();
  const { error, toggleFeature: patchCustomUrl } = useFeatures(AUTOMATIC_SUBSCRIPTION_CUSTOM_URL);
  const [isChecked, setIsChecked] = useState<boolean>(!!customUrl);
  const [inputValue, setInputValue] = useState<string>(customUrl);
  const debounceUpdateCustomUrl = useCallback(
    (url: string) => debounce(patchCustomUrl, 1000)(url),
    [patchCustomUrl],
  );

  return (
    <div className="AutomaticSubscriptionCustomUrl--main">
      <Flex alignItems={{ default: 'alignItemsCenter' }}>
        <Checkbox
          onChange={() =>
            setIsChecked((prevIsChecked) => {
              if (prevIsChecked) debounceUpdateCustomUrl('');
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
        <>
          <Flex>
            <Content component="p">URL</Content>
            <TextInput
              onChange={(_, value: string) => {
                setInputValue(value);
                debounceUpdateCustomUrl(value);
              }}
              className="AutomaticSubscriptionCustomUrl--input"
              id="custom-url-input"
              value={inputValue}
            />
          </Flex>
          <ErrorAlert error={error} />
        </>
      )}
    </div>
  );
};

export default AutomaticSubscriptionCustomUrl;
