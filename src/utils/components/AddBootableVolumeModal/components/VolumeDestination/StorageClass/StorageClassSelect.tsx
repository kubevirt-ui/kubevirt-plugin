import React, { Dispatch, FCC, SetStateAction, useCallback, useEffect } from 'react';

import { getSCSelectOptions } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useReadyStorageClasses from '@kubevirt-utils/hooks/useReadyStorageClasses/useReadyStorageClasses';
import { StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup } from '@patternfly/react-core';

type StorageClassSelectProps = {
  checkSC?: (selectedSC: string) => boolean;
  cluster?: string;
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
  setStorageClassName: (value: string) => void;
  setStorageClassProvisioner?: Dispatch<SetStateAction<string>>;
  storageClass: string;
};

const StorageClassSelect: FCC<StorageClassSelectProps> = ({
  checkSC,
  cluster,
  setShowSCAlert,
  setStorageClassName,
  setStorageClassProvisioner,
  storageClass,
}) => {
  const { t } = useKubevirtTranslation();

  const [{ clusterDefaultStorageClass }, defaultSCLoaded] = useDefaultStorageClass(cluster);
  const [{ readyStorageClasses }, readySCLoaded] = useReadyStorageClasses(cluster);

  const loaded = defaultSCLoaded && readySCLoaded;

  const onSelect = useCallback(
    (selection: string) => {
      setShowSCAlert(checkSC ? checkSC(selection) : false);
      setStorageClassName(selection);
      setStorageClassProvisioner?.(
        (readyStorageClasses || []).find((sc) => getName(sc) === selection)?.provisioner,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readyStorageClasses],
  );

  useEffect(() => {
    if (!storageClass && loaded && !isEmpty(clusterDefaultStorageClass)) {
      setStorageClassName(getName(clusterDefaultStorageClass));
      setStorageClassProvisioner?.(clusterDefaultStorageClass?.provisioner);
    }
  }, [
    clusterDefaultStorageClass,
    setStorageClassName,
    setStorageClassProvisioner,
    storageClass,
    loaded,
  ]);

  return (
    <FormGroup fieldId="storage-class" label={t('StorageClass')}>
      <div data-test-id="storage-class-select">
        {loaded ? (
          <InlineFilterSelect
            toggleProps={{
              isFullWidth: true,
            }}
            options={getSCSelectOptions(readyStorageClasses)}
            placeholder={t('Select {{label}}', { label: StorageClassModel.label })}
            popperProps={{ enableFlip: true }}
            selected={storageClass || getName(clusterDefaultStorageClass)}
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
