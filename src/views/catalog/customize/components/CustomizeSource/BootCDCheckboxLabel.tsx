import * as React from 'react';

import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type BootCDCheckboxProps = {
  cdSource: V1beta1DataVolumeSpec | undefined;
  onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
};

const BootCDCheckbox: React.FC<BootCDCheckboxProps> = ({ cdSource, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup fieldId="customize-boot-from-cd" className="disk-source-form-group">
      <Flex>
        <FlexItem>
          <Checkbox
            isChecked={!!cdSource}
            onChange={onChange}
            label={t('Boot from CD')}
            id="boot-cd"
          />
        </FlexItem>
        <FlexItem>
          <Popover
            aria-label={'Help'}
            bodyContent={() => (
              <div>
                {t(
                  'Boot from CD requires an image file i.e. ISO, qcow, etc. that will be mounted to the VM as a CD',
                )}
              </div>
            )}
          >
            <HelpIcon />
          </Popover>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default BootCDCheckbox;
