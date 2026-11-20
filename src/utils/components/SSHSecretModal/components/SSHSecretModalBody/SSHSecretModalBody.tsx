import { type FC } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import SecretSelectionRadioGroup from '@kubevirt-utils/components/SSHSecretModal/components/SecretSelectionRadioGroup';
import SSHKeyUpload from '@kubevirt-utils/components/SSHSecretModal/components/SSHKeyUpload/SSHKeyUpload';
import {
  SecretSelectionOption,
  type SSHSecretDetails,
} from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Grid, GridItem } from '@patternfly/react-core';

import SSHOptionUseExisting from '../SSHOptionUseExisting/SSHOptionUseExisting';

import './SSHSecretModalBody.scss';

type SSHSecretModalBodyProps = {
  cluster?: string;
  isTemplate: boolean;
  isUserTab: boolean;
  namespace: string;
};

const SSHSecretModalBody: FC<SSHSecretModalBodyProps> = ({
  cluster,
  isTemplate,
  isUserTab,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext<SSHSecretDetails>();

  const secretSelectionOption = useWatch({ control, name: 'secretOption' });

  const showDefaultCheckbox =
    (secretSelectionOption === SecretSelectionOption.AddNew && !isTemplate) ||
    (secretSelectionOption === SecretSelectionOption.UseExisting && !isTemplate);

  return (
    <Grid span={12}>
      <GridItem>
        <SecretSelectionRadioGroup />
      </GridItem>
      <GridItem className="ssh-secret-section__body">
        {secretSelectionOption === SecretSelectionOption.UseExisting && (
          <SSHOptionUseExisting cluster={cluster} namespace={namespace} />
        )}
        {secretSelectionOption === SecretSelectionOption.AddNew && (
          <SSHKeyUpload namespace={namespace} />
        )}
      </GridItem>
      {showDefaultCheckbox && (
        <Controller
          control={control}
          name="applyKeyToProject"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              className="pf-v6-u-mt-md"
              id="apply-key-to-project-per-user"
              isChecked={value || isUserTab}
              isDisabled={isUserTab}
              label={t(
                'Automatically apply this key to any new VirtualMachine you create in this project.',
              )}
              onChange={(_event, checked) => onChange(checked)}
            />
          )}
        />
      )}
    </Grid>
  );
};

export default SSHSecretModalBody;
