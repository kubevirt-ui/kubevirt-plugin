import { type FC, useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import { type IoK8sApiCoreV1ServiceAccount } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Stack } from '@patternfly/react-core';

import useFormContext from '../hooks/useFormContext';
import { type CloudIdentityProvider } from '../types/types';
import ExistingAccountField from './ExistingAccountField';
import NewAccountFields from './NewAccountFields';
import ServiceAccountSourceFields from './ServiceAccountSourceFields';

type FormFieldsProps = {
  canCreate: boolean;
  canRead: boolean;
  compatibleServiceAccounts: IoK8sApiCoreV1ServiceAccount[];
  currentServiceAccountName?: string;
  error?: Error;
  loaded: boolean;
  provider: CloudIdentityProvider;
  serviceAccounts: IoK8sApiCoreV1ServiceAccount[];
};

const FormFields: FC<FormFieldsProps> = ({
  canCreate,
  canRead,
  compatibleServiceAccounts,
  currentServiceAccountName,
  error,
  loaded,
  provider,
  serviceAccounts,
}) => {
  const { control, setValue } = useFormContext();
  const source = useWatch({ control, name: 'serviceAccountSource' });

  const serviceAccountOptions = useMemo(() => {
    const current = serviceAccounts.find(
      (serviceAccount) => getName(serviceAccount) === currentServiceAccountName,
    );

    return current && !compatibleServiceAccounts.includes(current)
      ? [...compatibleServiceAccounts, current]
      : compatibleServiceAccounts;
  }, [compatibleServiceAccounts, currentServiceAccountName, serviceAccounts]);

  const isExistingUnavailable = Boolean(
    loaded && canRead && !error && isEmpty(compatibleServiceAccounts),
  );

  useEffect(() => {
    if (isExistingUnavailable && canCreate && source === 'existing') {
      setValue('serviceAccountSource', 'new', { shouldDirty: false, shouldValidate: true });
    }
  }, [canCreate, isExistingUnavailable, setValue, source]);

  return (
    <Stack hasGutter>
      <ServiceAccountSourceFields
        canCreate={canCreate}
        isExistingUnavailable={isExistingUnavailable}
      />

      {source === 'existing' && (
        <ExistingAccountField
          canRead={canRead}
          error={error}
          isExistingUnavailable={isExistingUnavailable}
          loaded={loaded}
          provider={provider}
          serviceAccounts={serviceAccountOptions}
        />
      )}

      {source === 'new' && <NewAccountFields provider={provider} />}
    </Stack>
  );
};

export default FormFields;
