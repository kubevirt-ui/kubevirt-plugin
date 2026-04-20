import React, { FCC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import NumberTextInput from '../../../../utils/components/NumberTextInput/NumberTextInput';

type QuotaFormResourceLimitInputProps = {
  placeholder?: string;
  promptType: OLSPromptType;
  resourceKey: string;
  resourceLimitLabel: string;
  setValue: (value: number) => void;
  tooltipText: string;
  unitLabel: string;
  value: number;
};

const QuotaFormResourceLimitInput: FCC<QuotaFormResourceLimitInputProps> = ({
  placeholder,
  promptType,
  resourceKey,
  resourceLimitLabel,
  setValue,
  tooltipText,
  unitLabel,
  value,
}) => {
  const { t } = useKubevirtTranslation();

  const helpTextContent = (
    <Stack hasGutter>
      <StackItem>{tooltipText}</StackItem>
      <StackItem>{t('Maps to {{resourceKey}}', { resourceKey })}</StackItem>
    </Stack>
  );

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={(hide) => {
            return promptType ? (
              <PopoverContentWithLightspeedButton
                content={
                  <Stack hasGutter>
                    <StackItem>{tooltipText}</StackItem>
                    <StackItem>{t('Maps to {{resourceKey}}', { resourceKey })}</StackItem>
                  </Stack>
                }
                hide={hide}
                promptType={promptType}
              />
            ) : (
              helpTextContent
            );
          }}
        />
      }
      label={resourceLimitLabel}
    >
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <NumberTextInput placeholder={placeholder} setValue={setValue} value={value} />
        <span>{unitLabel}</span>
      </Flex>
    </FormGroup>
  );
};

export default QuotaFormResourceLimitInput;
