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

import { DiskFormState } from '../../utils/types';
import {
  storageClassField,
  storageClassProvisionerField,
  storageClassSelectFieldID,
} from '../utils/constants';

import { getSCSelectOptions } from './utils/helpers';

type StorageClassSelectProps = {
  checkSC?: (selectedSC: string) => boolean;
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
};

const StorageClassSelect: FC<StorageClassSelectProps> = ({ checkSC, setShowSCAlert }) => {
  const { t } = useKubevirtTranslation();
  const { control, setValue, watch } = useFormContext<DiskFormState>();

  const storageClass = watch(storageClassField);

  const [{ clusterDefaultStorageClass, storageClasses }, loaded] = useDefaultStorageClass();

  const defaultSC = useMemo(() => clusterDefaultStorageClass, [clusterDefaultStorageClass]);

  const scMapper = useMemo(() => convertResourceArrayToMap(storageClasses), [storageClasses]);
  const onSelect = useCallback(
    (selection: string) => {
      setShowSCAlert(checkSC ? checkSC(selection) : false);
      setValue(storageClassField, selection);
      setValue(storageClassProvisionerField, scMapper[selection]?.provisioner);
    },
    [checkSC, scMapper, setShowSCAlert, setValue],
  );

  useEffect(() => {
    if (isEmpty(storageClass) && loaded && !isEmpty(defaultSC)) {
      setValue(storageClassField, getName(defaultSC));
      setValue(storageClassProvisionerField, defaultSC?.provisioner);
    }
  }, [defaultSC, storageClass, loaded, setValue]);

  if (!loaded) return <Loading />;

  return (
    <FormGroup fieldId={storageClassSelectFieldID} label={t('StorageClass')}>
      <div data-test-id={storageClassSelectFieldID}>
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
          name={storageClassField}
        />
      </div>
    </FormGroup>
  );
};

export default StorageClassSelect;
