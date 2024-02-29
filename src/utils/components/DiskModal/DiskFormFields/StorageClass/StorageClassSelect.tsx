import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo } from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';

import { getDefaultStorageClass, getSCSelectOptions } from '../utils/helpers';

import { AlertedStorageClassSelectProps } from './AlertedStorageClassSelect';

type StorageClassSelectProps = {
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
} & AlertedStorageClassSelectProps;

const StorageClassSelect: FC<StorageClassSelectProps> = ({
  checkSC,
  setShowSCAlert,
  setStorageClassName,
  setStorageClassProvisioner,
  storageClass,
}) => {
  const { t } = useKubevirtTranslation();

  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);

  const onSelect = useCallback(
    (selection: string) => {
      setShowSCAlert(checkSC ? checkSC(selection) : false);
      setStorageClassName(selection);
      setStorageClassProvisioner?.(
        (storageClasses || []).find((sc) => getName(sc) === selection)?.provisioner,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageClasses],
  );

  useEffect(() => {
    if (!storageClass && loaded && !isEmpty(defaultSC)) {
      setStorageClassName(defaultSC?.metadata?.name);
      setStorageClassProvisioner?.(defaultSC?.provisioner);
    }
  }, [defaultSC, setStorageClassName, setStorageClassProvisioner, storageClass, loaded]);

  return (
    <>
      <FormGroup fieldId="storage-class" label={t('StorageClass')}>
        <div data-test-id="storage-class-select">
          {loaded ? (
            <InlineFilterSelect
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select {{label}}', { label: StorageClassModel.label }),
              }}
              options={getSCSelectOptions(storageClasses)}
              popperProps={{ enableFlip: true }}
              selected={storageClass || defaultSC?.metadata?.name}
              setSelected={onSelect}
            />
          ) : (
            <Loading />
          )}
        </div>
      </FormGroup>
    </>
  );
};

export default StorageClassSelect;
