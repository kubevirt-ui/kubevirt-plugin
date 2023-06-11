import * as React from 'react';

import { V1beta1DataVolumeSpec, V1ContainerDiskSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Flex, FlexItem, FormGroup, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type BootCDCheckboxProps = {
  cdSource: undefined | V1beta1DataVolumeSpec | V1ContainerDiskSource;
  onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
};

const BootCDCheckbox: React.FC<BootCDCheckboxProps> = ({ cdSource, onChange }) => {
  const { t } = useKubevirtTranslation();

  return (
    <FormGroup className="disk-source-form-group" fieldId="customize-boot-from-cd">
      <Flex>
        <FlexItem>
          <Checkbox
            data-test-id="boot-cd"
            id="boot-cd"
            isChecked={!!cdSource}
            label={t('Boot from CD')}
            onChange={onChange}
          />
        </FlexItem>
        <FlexItem>
          <Popover
            bodyContent={() => (
              <div>
                {t(
                  'Boot from CD requires an image file i.e. ISO, qcow, etc. that will be mounted to the VirtualMachine as a CD',
                )}
              </div>
            )}
            aria-label={'Help'}
          >
            <HelpIcon />
          </Popover>
        </FlexItem>
      </Flex>
    </FormGroup>
  );
};

export default BootCDCheckbox;
