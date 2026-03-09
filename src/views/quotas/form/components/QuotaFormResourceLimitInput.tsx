import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FormGroup, Stack, StackItem } from '@patternfly/react-core';

import NumberTextInput from '../../../../utils/components/NumberTextInput/NumberTextInput';

type QuotaFormResourceLimitInputProps = {
  placeholder?: string;
  resourceKey: string;
  resourceLimitLabel: string;
  setValue: (value: number) => void;
  tooltipText: string;
  unitLabel: string;
  value: number;
};

const QuotaFormResourceLimitInput: FC<QuotaFormResourceLimitInputProps> = ({
  placeholder,
  resourceKey,
  resourceLimitLabel,
  setValue,
  tooltipText,
  unitLabel,
  value,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup
      labelHelp={
        <HelpTextIcon
          bodyContent={
            <Stack hasGutter>
              <StackItem>{tooltipText}</StackItem>
              <StackItem>{t('Maps to {{resourceKey}}', { resourceKey })}</StackItem>
            </Stack>
          }
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
