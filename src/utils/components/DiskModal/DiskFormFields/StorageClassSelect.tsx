import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, FormGroup, Select, SelectVariant } from '@patternfly/react-core';

import { FilterSCSelect, getSCSelectOptions } from './utils/Filters';
import { getDefaultStorageClass } from './utils/helpers';

type StorageClassSelectProps = {
  storageClass: string;
  setStorageClassName: (scName: string) => void;
  setStorageClassProvisioner?: (scProvisioner: string) => void;
};

const StorageClassSelect: React.FC<StorageClassSelectProps> = ({
  storageClass,
  setStorageClassName,
  setStorageClassProvisioner,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSCAlert, setShowSCAlert] = useState<boolean>(false);

  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);

  const onSelect = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, selection: string) => {
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
      setStorageClassProvisioner(defaultSC?.provisioner);
    }
  }, [defaultSC, setStorageClassName, setStorageClassProvisioner, storageClass, loaded]);

  return (
    <>
      <FormGroup fieldId="storage-class" label={t('StorageClass')}>
        <div data-test-id="storage-class-select">
          {loaded ? (
            <Select
              menuAppendTo="parent"
              isOpen={isOpen}
              onToggle={setIsOpen}
              onSelect={onSelect}
              variant={SelectVariant.single}
              selections={storageClass}
              onFilter={FilterSCSelect(storageClasses)}
              hasInlineFilter
              maxHeight={200}
              placeholderText={t('Select StorageClass')}
            >
              {getSCSelectOptions(storageClasses)}
            </Select>
          ) : (
            <Loading />
          )}
        </div>
      </FormGroup>
      {showSCAlert && (
        <Alert
          title={t('Selected StorageClass is different from the default StorageClass')}
          isInline
          variant={AlertVariant.info}
        >
          {t('Selecting a different StorageClass might cause poor performance.')}
        </Alert>
      )}
    </>
  );
};

export default StorageClassSelect;
