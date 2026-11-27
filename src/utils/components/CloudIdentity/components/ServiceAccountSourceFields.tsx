import { type FC } from 'react';
import { Controller } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup, Radio } from '@patternfly/react-core';

import useFormContext from '../hooks/useFormContext';

type ServiceAccountSourceFieldsProps = {
  canCreate: boolean;
  isExistingUnavailable: boolean;
};

const ServiceAccountSourceFields: FC<ServiceAccountSourceFieldsProps> = ({
  canCreate,
  isExistingUnavailable,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useFormContext();

  return (
    <FormGroup fieldId="cloud-identity-existing-source" label={t('ServiceAccount')}>
      <Controller
        control={control}
        name="serviceAccountSource"
        render={({ field }) => (
          <>
            <Radio
              description={
                isExistingUnavailable
                  ? t('No compatible ServiceAccounts are available for this provider')
                  : undefined
              }
              id="cloud-identity-existing-source"
              isChecked={field.value === 'existing'}
              isDisabled={isExistingUnavailable}
              label={t('Use an existing ServiceAccount')}
              name={field.name}
              onChange={(_event, checked) => checked && field.onChange('existing')}
            />
            <Radio
              body={
                !canCreate
                  ? t("You don't have permission to create ServiceAccounts in this project")
                  : undefined
              }
              id="cloud-identity-new-source"
              isChecked={field.value === 'new'}
              isDisabled={!canCreate}
              label={t('Create a new ServiceAccount')}
              name={field.name}
              onChange={(_event, checked) => checked && field.onChange('new')}
            />
          </>
        )}
      />
    </FormGroup>
  );
};

export default ServiceAccountSourceFields;
