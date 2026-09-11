import { type FC, useEffect, useMemo, useState } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type RHELAutomaticSubscriptionData } from '@kubevirt-utils/hooks/useRHELAutomaticSubscription/utils/types';
import { debounce } from '@kubevirt-utils/utils/debounce';
import { Checkbox, Content, Flex, PopoverPosition, TextInput } from '@patternfly/react-core';

import './automatic-subscription-custom-url.scss';

type AutomaticSubscriptionCustomUrlProps = {
  canEdit: boolean;
  customUrl: string;
  updateSubscription: (data: Partial<RHELAutomaticSubscriptionData>) => void;
};

const AutomaticSubscriptionCustomUrl: FC<AutomaticSubscriptionCustomUrlProps> = ({
  canEdit,
  customUrl,
  updateSubscription,
}) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(!!customUrl);
  const [inputValue, setInputValue] = useState<string>(customUrl);

  useEffect(() => {
    setIsChecked(!!customUrl);
    setInputValue(customUrl);
  }, [customUrl]);

  const debounceUpdateCustomUrl = useMemo(
    () =>
      debounce((url: string): void => {
        updateSubscription({ customUrl: url });
      }, 1000),
    [updateSubscription],
  );

  return (
    <div>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <Checkbox
          id="auto-register-rhel"
          isChecked={isChecked}
          isDisabled={!canEdit}
          label={t('Use custom registration server url')}
          onChange={() =>
            setIsChecked((prevIsChecked) => {
              if (prevIsChecked) {
                debounceUpdateCustomUrl('');
              }
              return !prevIsChecked;
            })
          }
        />
        <HelpTextIcon
          bodyContent={t('Select this option if you use an on-premise subscription service')}
          position={PopoverPosition.right}
        />
      </Flex>
      {isChecked && (
        <Flex>
          <Content component="p">{t('URL')}</Content>
          <TextInput
            className="AutomaticSubscriptionCustomUrl--input"
            id="custom-url-input"
            isDisabled={!canEdit}
            onChange={(_event, value: string) => {
              setInputValue(value);
              debounceUpdateCustomUrl(value);
            }}
            value={inputValue}
          />
        </Flex>
      )}
    </div>
  );
};

export default AutomaticSubscriptionCustomUrl;
