import React, { useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
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

import { storageCheckupImageSettings } from '../../utils/const';

import CheckupsStorageFormActions from './CheckupsStorageFormActions';

import './checkups-storage-form.scss';

const CheckupsStorageForm = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [name, setName] = useState<string>(generatePrettyName('kubevirt-storage-checkup'));
  const [timeOut, setTimeOut] = useState<string>('10');
  const [checkupImage, checkupImageLoaded, checkupImageLoadError] = useRelatedImage({
    ...storageCheckupImageSettings,
    cluster,
  });

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
              labelHelp={
                <Popover
                  bodyContent={t('How much time before the check will try to close itself')}
                  position={PopoverPosition.right}
                >
                  <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
                </Popover>
              }
              fieldId="timeout"
              isRequired
              label={t('Timeout (minutes)')}
            >
              <TextInput
                className="CheckupsStorageForm--main__number-input"
                id="timeout"
                isRequired
                name="timeout"
                onChange={(_event, val) => setTimeOut(val)}
                type="number"
                value={timeOut}
              />
            </FormGroup>
            {checkupImageLoadError && (
              <CheckupImageField
                checkupImage={checkupImage}
                checkupImageLoaded={checkupImageLoaded}
                checkupImageLoadError={checkupImageLoadError}
              />
            )}
            <CheckupsStorageFormActions checkupImage={checkupImage} name={name} timeOut={timeOut} />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsStorageForm;
