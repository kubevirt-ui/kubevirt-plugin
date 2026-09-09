import React, { type JSX } from 'react';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import { Alert, AlertVariant, FormGroup } from '@patternfly/react-core';

type StorageClassFieldProps = {
  defaultSC: ReturnType<typeof getDefaultStorageClass>;
  onStorageClassChange: (value: string) => void;
  selectedStorageClass: string;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesError: Error;
  storageClassesLoaded: boolean;
};

const StorageClassField = ({
  defaultSC,
  onStorageClassChange,
  selectedStorageClass,
  storageClasses,
  storageClassesError,
  storageClassesLoaded,
}: StorageClassFieldProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const selectedValue = selectedStorageClass
    ? selectedStorageClass
    : (defaultSC?.metadata?.name ?? '');

  return (
    <FormGroup className="form-group-spacing" fieldId="storage-class" label={t('Storage class')}>
      {storageClassesLoaded ? (
        <InlineFilterSelect
          options={getSCSelectOptions(storageClasses) ?? []}
          placeholder={t('Select {{label}}', { label: StorageClassModel.label })}
          popperProps={{ enableFlip: true }}
          selected={selectedValue}
          setSelected={onStorageClassChange}
          toggleProps={{
            isFullWidth: true,
          }}
        />
      ) : (
        <Loading />
      )}
      {storageClassesError && (
        <Alert
          className="form-group-spacing"
          isInline
          title={t('Failed to load storage classes')}
          variant={AlertVariant.danger}
        >
          {storageClassesError?.message}
        </Alert>
      )}
    </FormGroup>
  );
};

export default StorageClassField;
