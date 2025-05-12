import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup } from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import {
  STORAGE_CLASS_FIELD,
  STORAGE_CLASS_PROVIDER_FIELD,
  STORAGECLASS_SELECT_FIELDID,
} from '../utils/constants';

import { getSCSelectOptions } from './utils/helpers';

type StorageClassSelectProps = {
  checkSC?: (selectedSC: string) => boolean;
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
};

const StorageClassSelect: FC<StorageClassSelectProps> = ({ checkSC, setShowSCAlert }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<V1DiskFormState>();

  const storageClass = watch(STORAGE_CLASS_FIELD);

  const [{ clusterDefaultStorageClass, storageClasses }, loaded] = useDefaultStorageClass();

  const defaultSC = useMemo(() => clusterDefaultStorageClass, [clusterDefaultStorageClass]);

  const scMapper = useMemo(() => convertResourceArrayToMap(storageClasses), [storageClasses]);
  const onSelect = useCallback(
    (selection: string) => {
      setShowSCAlert(checkSC ? checkSC(selection) : false);
      setValue(STORAGE_CLASS_FIELD, selection);

      setValue(STORAGE_CLASS_PROVIDER_FIELD, scMapper[selection]?.provisioner);
    },
    [checkSC, scMapper, setShowSCAlert, setValue],
  );

  useEffect(() => {
    if (isEmpty(storageClass) && loaded && !isEmpty(defaultSC)) {
      setValue(STORAGE_CLASS_FIELD, getName(defaultSC));
      setValue(STORAGE_CLASS_PROVIDER_FIELD, defaultSC?.provisioner);
    }
  }, [defaultSC, storageClass, loaded, setValue]);

  if (!loaded) return <Loading />;

  return (
    <FormGroup fieldId={STORAGECLASS_SELECT_FIELDID} label={t('StorageClass')}>
      <div data-test-id={STORAGECLASS_SELECT_FIELDID}>
        <Controller
          render={({ field: { value } }) => (
            <InlineFilterSelect
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select {{label}}', { label: StorageClassModel.label }),
              }}
              options={getSCSelectOptions(storageClasses)}
              popperProps={{ enableFlip: true }}
              selected={value}
              setSelected={onSelect}
            />
          )}
          control={control}
          name={STORAGE_CLASS_FIELD}
        />
      </div>
    </FormGroup>
  );
};

export default StorageClassSelect;
