import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

type BootCDCheckboxProps = {
  hasCDSource: boolean;
  onChange: (checked: boolean) => void;
};

const BootCDCheckbox: FC<BootCDCheckboxProps> = ({ hasCDSource, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup className="disk-source-form-group" fieldId="customize-boot-from-cd">
      <Flex gap={{ default: 'gapSm' }}>
        <FlexItem>
          <Checkbox
            data-test-id="boot-cd"
            id="boot-cd"
            isChecked={hasCDSource}
            label={t('Boot from CD')}
            onChange={(_, checked: boolean) => onChange(checked)}
          />
        </FlexItem>
        <FlexItem>
          <HelpTextIcon
            bodyContent={
              <div>
                {t(
                  'Boot from CD requires an image file i.e. ISO, qcow, etc. that will be mounted to the VirtualMachine as a CD',
                )}
              </div>
            }
          />
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default BootCDCheckbox;
