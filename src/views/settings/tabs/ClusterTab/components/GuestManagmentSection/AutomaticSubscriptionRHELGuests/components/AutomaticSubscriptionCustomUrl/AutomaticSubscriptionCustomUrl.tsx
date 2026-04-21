import React, { FC, useCallback, useEffect, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { AUTOMATIC_SUBSCRIPTION_CUSTOM_URL } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { debounce } from '@kubevirt-utils/utils/debounce';
import { Checkbox, Content, Flex, PopoverPosition, TextInput } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

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
  const cluster = useSettingsCluster();
  const { error, toggleFeature: patchCustomUrl } = useFeatures(
    AUTOMATIC_SUBSCRIPTION_CUSTOM_URL,
    cluster,
  );
  const [isChecked, setIsChecked] = useState<boolean>(!!customUrl);
  const [inputValue, setInputValue] = useState<string>(customUrl);

  useEffect(() => {
    setIsChecked(!!customUrl);
    setInputValue(customUrl);
  }, [customUrl]);

  const debounceUpdateCustomUrl = useCallback(
    (url: string) => debounce(patchCustomUrl, 1000)(url),
    [patchCustomUrl],
  );

  return (
    <div>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <Checkbox
          onChange={() =>
            setIsChecked((prevIsChecked) => {
              if (prevIsChecked) debounceUpdateCustomUrl('');
              return !prevIsChecked;
            })
          }
          id="auto-register-rhel"
          isChecked={isChecked && !isDisabled}
          isDisabled={isDisabled}
          label={t('Use custom registration server url')}
        />
        <HelpTextIcon
          bodyContent={t('Select this option if you use an on-premise subscription service')}
          position={PopoverPosition.right}
        />
      </Flex>
      {isChecked && !isDisabled && (
        <>
          <Flex>
            <Content component="p">{t('URL')}</Content>
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
