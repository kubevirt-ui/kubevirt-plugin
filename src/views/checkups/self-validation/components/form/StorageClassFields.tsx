import React, { type FC, type ReactNode } from 'react';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { getSCSelectOptions } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { StorageClassModel } from '@kubevirt-utils/models';
import { FormGroup, PopoverPosition, Switch } from '@patternfly/react-core';

import { type AdvancedSettingsProps } from './types';

type StorageClassFieldsProps = Pick<
  AdvancedSettingsProps,
  | 'effectiveStorageClassName'
  | 'isDryRun'
  | 'pvcSize'
  | 'setIsDryRun'
  | 'setPvcSize'
  | 'setStorageClass'
  | 'storageClasses'
  | 'storageClassesLoaded'
> & {
  afterPvc?: ReactNode;
  afterStorageClass?: ReactNode;
};

const StorageClassFields: FC<StorageClassFieldsProps> = ({
  afterPvc,
  afterStorageClass,
  effectiveStorageClassName,
  isDryRun,
  pvcSize,
  setIsDryRun,
  setPvcSize,
  setStorageClass,
  storageClasses,
  storageClassesLoaded,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FormGroup className="form-group-spacing" fieldId="storage-class" label={t('Storage class')}>
        {storageClassesLoaded ? (
          <InlineFilterSelect
            options={getSCSelectOptions(storageClasses)}
            placeholder={t('Select {{label}}', { label: StorageClassModel.label })}
            popperProps={{ enableFlip: true }}
            selected={effectiveStorageClassName}
            setSelected={setStorageClass}
            toggleProps={{
              isFullWidth: true,
            }}
          />
        ) : (
          <Loading />
        )}
      </FormGroup>
      {afterStorageClass}
      <FormGroup className="form-group-spacing" fieldId="pvc-size" label={t('PVC size')}>
        <CapacityInput onChange={setPvcSize} size={pvcSize} />
      </FormGroup>
      {afterPvc}
      <Switch
        id="dry-run"
        isChecked={isDryRun}
        isReversed={true}
        label={
          <>
            <span className="pf-v6-c-form__label-text">{t('Dry run')}</span>
            <HelpTextIcon
              bodyContent={t(
                'Run the validation in dry run mode (no actual tests will be executed)',
              )}
              helpIconClassName="pf-v6-u-ml-sm"
              position={PopoverPosition.right}
            />
          </>
        }
        onChange={(_event, checked): void => setIsDryRun(checked)}
      />
    </>
  );
};

export default StorageClassFields;
