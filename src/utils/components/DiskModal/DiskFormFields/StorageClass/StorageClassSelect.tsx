import React, {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormGroup, Select, SelectVariant } from '@patternfly/react-core';

import { FilterSCSelect, getSCSelectOptions } from '../utils/Filters';

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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [{ clusterDefaultStorageClass, storageClasses, virtDefaultStorageClass }, loaded] =
    useDefaultStorageClass();

  const defaultSC = useMemo(() => {
    if (!isEmpty(virtDefaultStorageClass)) return virtDefaultStorageClass;
    if (!isEmpty(clusterDefaultStorageClass)) return clusterDefaultStorageClass;
    return null;
  }, [virtDefaultStorageClass, clusterDefaultStorageClass]);

  const onSelect = useCallback(
    (event: ChangeEvent<Element>, selection: string) => {
      setShowSCAlert(checkSC ? checkSC(selection) : false);
      setStorageClassName(selection);
      setIsOpen(false);
      setStorageClassProvisioner?.(
        (storageClasses || []).find((sc) => sc?.metadata?.name === selection)?.provisioner,
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
            <Select
              hasInlineFilter
              isOpen={isOpen}
              maxHeight={200}
              menuAppendTo="parent"
              onFilter={FilterSCSelect(storageClasses)}
              onSelect={onSelect}
              onToggle={setIsOpen}
              placeholderText={t('Select StorageClass')}
              selections={storageClass}
              variant={SelectVariant.single}
            >
              {getSCSelectOptions(storageClasses)}
            </Select>
          ) : (
            <Loading />
          )}
        </div>
      </FormGroup>
    </>
  );
};

export default StorageClassSelect;
