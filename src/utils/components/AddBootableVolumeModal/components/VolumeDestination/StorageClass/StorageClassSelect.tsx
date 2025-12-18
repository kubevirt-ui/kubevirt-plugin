import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo } from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  getDefaultStorageClass,
  getSCSelectOptions,
} from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { FormGroup } from '@patternfly/react-core';

type StorageClassSelectProps = {
  checkSC?: (selectedSC: string) => boolean;
  cluster?: string;
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
  setStorageClassName: (value: string) => void;
  setStorageClassProvisioner?: Dispatch<SetStateAction<string>>;
  storageClass: string;
};

const StorageClassSelect: FC<StorageClassSelectProps> = ({
  checkSC,
  cluster,
  setShowSCAlert,
  setStorageClassName,
  setStorageClassProvisioner,
  storageClass,
}) => {
  const { t } = useKubevirtTranslation();

  const [storageClasses, loaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
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
  );
};

export default StorageClassSelect;
