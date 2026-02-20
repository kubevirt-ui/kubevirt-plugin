import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Flex, FormGroup } from '@patternfly/react-core';

import NumberTextInput from '../../../../utils/components/NumberTextInput/NumberTextInput';

type QuotaFormResourceLimitInputProps = {
  helpIconContent: string;
  placeholder?: string;
  resourceLimitLabel: string;
  setValue: (value: number) => void;
  unitLabel: string;
  value: number;
};

const QuotaFormResourceLimitInput: FC<QuotaFormResourceLimitInputProps> = ({
  helpIconContent,
  placeholder,
  resourceLimitLabel,
  setValue,
  unitLabel,
  value,
}) => {
  return (
    <FormGroup
      label={resourceLimitLabel}
      labelHelp={<HelpTextIcon bodyContent={helpIconContent} />}
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
