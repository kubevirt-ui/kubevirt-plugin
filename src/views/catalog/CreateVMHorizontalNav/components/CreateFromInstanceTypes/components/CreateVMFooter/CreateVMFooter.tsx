import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './CreateVMFooter.scss';

const CreateVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const [startVM, setStartVM] = useState(true);
  return (
    <footer className="create-vm-instance-type-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="start-after-create-checkbox"
            isChecked={startVM}
            onChange={setStartVM}
            label={t('Start this VirtualMachine after creation')}
          />
        </StackItem>
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <Button variant={ButtonVariant.primary}>{t('Quick create VirtualMachine')}</Button>
            </SplitItem>
            <SplitItem>
              <Button variant={ButtonVariant.link}>{t('Cancel')}</Button>
            </SplitItem>
          </Split>
        </StackItem>
      </Stack>
    </footer>
  );
};

export default CreateVMFooter;
