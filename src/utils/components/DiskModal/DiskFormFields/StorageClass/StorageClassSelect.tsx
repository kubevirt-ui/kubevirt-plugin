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

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectVariant } from '@patternfly/react-core';

import { FilterSCSelect, getSCSelectOptions } from '../utils/Filters';
import { getDefaultStorageClass } from '../utils/helpers';

import { AlertedStorageClassSelectProps } from './AlertedStorageClassSelect';

type StorageClassSelectProps = {
  setShowSCAlert: Dispatch<SetStateAction<boolean>>;
} & AlertedStorageClassSelectProps;

const StorageClassSelect: FC<StorageClassSelectProps> = ({
  setShowSCAlert,
  setStorageClassName,
  setStorageClassProvisioner,
  storageClass,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);

  const onSelect = useCallback(
    (event: ChangeEvent<Element>, selection: string) => {
      setShowSCAlert(selection !== defaultSC?.metadata?.name);
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
    if (!storageClass && loaded) {
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
