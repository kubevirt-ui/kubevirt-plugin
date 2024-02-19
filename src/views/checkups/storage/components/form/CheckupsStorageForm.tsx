import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import CheckupsStorageFormActions from './CheckupsStorageFormActions';

import './checkups-storage-form.scss';

const CheckupsStorageForm = () => {
  const { t } = useKubevirtTranslation();
  const [name, setName] = useState<string>(generatePrettyName('kubevirt-storage-checkup'));
  const [timeOut, setTimeOut] = useState<string>();

  return (
    <Grid>
      <GridItem span={6}>
        <Form className={'CheckupsStorageForm--main'}>
          <FormSection title={t('Run storage checkup')} titleElement="h1">
            {t(
              `Storage checkup validating storage is working correctly for VirtualMachines using the kiagnose engine.`,
            )}

            <FormGroup fieldId="name" isRequired label={t('Name')}>
              <TextInput
                id="name"
                isRequired
                name="name"
                onChange={(_event, value) => setName(value)}
                value={name}
              />
            </FormGroup>
            <FormGroup
              labelIcon={
                <Popover
                  bodyContent={t('How much time before the check will try to close itself')}
                  position={PopoverPosition.right}
                >
                  <Button variant={ButtonVariant.plain}>
                    <HelpIcon />
                  </Button>
                </Popover>
              }
              fieldId="timeout"
              isRequired
              label={t('Timeout (minutes)')}
            >
              <TextInput
                id="timeout"
                isRequired
                name="timeout"
                onChange={(_event, val) => setTimeOut(val)}
                type="number"
                value={timeOut}
              />
            </FormGroup>
            <CheckupsStorageFormActions name={name} timeOut={timeOut} />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsStorageForm;
