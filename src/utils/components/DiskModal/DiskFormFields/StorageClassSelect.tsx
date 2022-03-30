import * as React from 'react';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, Select, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, DiskReducerActionType } from '../state/actions';

import { FilterSCSelect, getSCSelectOptions } from './utils/Filters';
import { getDefaultStorageClass } from './utils/helpers';

type StorageClassSelectProps = {
  storageClass: string;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
};

const StorageClassSelect: React.FC<StorageClassSelectProps> = ({
  storageClass,
  dispatchDiskState,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const [storageClasses, loaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>({
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const onSelect = React.useCallback(
    (event: React.MouseEvent<Element, MouseEvent>, selection: string) => {
      dispatchDiskState({ type: diskReducerActions.SET_STORAGE_CLASS, payload: selection });
      setIsOpen(false);
      const provisioner = storageClasses.find(
        (sc) => sc?.metadata?.name === selection,
      )?.provisioner;
      dispatchDiskState({
        type: diskReducerActions.SET_STORAGE_CLASS_PROVISIONER,
        payload: provisioner,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storageClasses],
  );

  // inserting the default storage class as initial value
  React.useEffect(() => {
    if (!loaded) {
      return;
    } else if (storageClasses.length === 0) {
      dispatchDiskState({ type: diskReducerActions.SET_STORAGE_CLASS, payload: null });
    } else if (!storageClass) {
      const defaultSC = getDefaultStorageClass(storageClasses);
      dispatchDiskState({
        type: diskReducerActions.SET_STORAGE_CLASS,
        payload: defaultSC?.metadata.name || storageClasses?.[0].metadata.name,
      });
      dispatchDiskState({
        type: diskReducerActions.SET_STORAGE_CLASS_PROVISIONER,
        payload: defaultSC?.provisioner || storageClasses?.[0].provisioner,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, storageClass, storageClasses]);
  return (
    <FormGroup fieldId="storage-class" label={t('StorageClass')}>
      {loaded ? (
        <Select
          menuAppendTo="parent"
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          selections={storageClass}
          onFilter={FilterSCSelect(storageClasses, t)}
          hasInlineFilter
          maxHeight={200}
          direction="up"
        >
          {getSCSelectOptions(storageClasses, t)}
        </Select>
      ) : (
        <Loading />
      )}
    </FormGroup>
  );
};

export default StorageClassSelect;
