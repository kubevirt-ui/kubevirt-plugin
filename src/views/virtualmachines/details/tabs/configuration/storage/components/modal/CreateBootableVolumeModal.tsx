import React, { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import xbytes from 'xbytes';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import VolumeDestination from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeDestination/VolumeDestination';
import VolumeMetadata from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/VolumeMetadata';
import {
  AddBootableVolumeState,
  initialBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { hasSizeUnit } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PopoverPosition, Stack, Title } from '@patternfly/react-core';

import { createBootableVolumeFromDisk } from './utils';

type CreateBootableVolumeModalProps = {
  diskObj: DiskRowDataLayout;
  isOpen: boolean;
  onClose: () => void;
  vm: V1VirtualMachine;
};

const CreateBootableVolumeModal: FC<CreateBootableVolumeModalProps> = ({
  diskObj,
  isOpen,
  onClose,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const [pvc, pvcLoaded] = useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim>({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    name: diskObj.source,
    namespace: diskObj?.namespace,
  });

  const [bootableVolume, setBootableVolume] = useState<AddBootableVolumeState>({
    ...initialBootableVolumeState,
    bootableVolumeName: `${getName(vm)}-${diskObj.name}`,
    bootableVolumeNamespace: getNamespace(vm),
    labels: {
      [DEFAULT_INSTANCETYPE_LABEL]: getInstanceTypeMatcher(vm)?.name,
      [DEFAULT_PREFERENCE_LABEL]: getPreferenceMatcher(vm)?.name,
    },
    pvcName: diskObj.source,
    pvcNamespace: diskObj?.namespace,
    storageClassName: diskObj?.storageClass === NO_DATA_DASH ? null : diskObj?.storageClass,
  });
  const applyStorageProfileState = useState<boolean>(true);

  const claimPropertySetsData = useStorageProfileClaimPropertySets(
    bootableVolume?.storageClassName,
  );

  const setBootableVolumeField: SetBootableVolumeFieldType = useCallback(
    (key, fieldKey) => (value) =>
      setBootableVolume((prevState) => ({
        ...prevState,
        ...(fieldKey
          ? { [key]: { ...(prevState[key] as object), [fieldKey]: value } }
          : { ...prevState, [key]: value }),
      })),
    [],
  );

  const deleteLabel = (labelKey: string) => {
    setBootableVolume((prev) => {
      const updatedLabels = { ...prev?.labels };
      delete updatedLabels[labelKey];

      return { ...prev, labels: updatedLabels };
    });
  };

  const onSubmit = async () => {
    const createdDS = await createBootableVolumeFromDisk(
      diskObj,
      vm,
      bootableVolume,
      applyStorageProfileState[0],
      claimPropertySetsData.claimPropertySets,
    );

    navigate(getResourceUrl({ model: DataSourceModel, resource: createdDS }));
  };

  useEffect(() => {
    if (!pvcLoaded) return;

    const pvcSize = pvc?.spec?.resources?.requests?.storage;

    const newBootSize = hasSizeUnit(pvcSize)
      ? pvcSize
      : removeByteSuffix(xbytes(Number(pvcSize), { iec: true, space: false }));

    setBootableVolumeField('size')(newBootSize);
  }, [pvc, pvcLoaded, setBootableVolumeField]);

  return (
    <TabModal<V1beta1DataSource>
      headerText={t('Save as bootable volume')}
      isDisabled={!bootableVolume?.labels?.[DEFAULT_PREFERENCE_LABEL]}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Save')}
    >
      <Stack hasGutter>
        <Title className="pf-u-mt-md" headingLevel="h5">
          {t('Destination details')}
        </Title>
        <VolumeDestination
          applyStorageProfileState={applyStorageProfileState}
          bootableVolume={bootableVolume}
          claimPropertySetsData={claimPropertySetsData}
          setBootableVolumeField={setBootableVolumeField}
        />
        <Title className="pf-u-mt-md" headingLevel="h5">
          {t('Volume metadata')}{' '}
          <HelpTextIcon
            bodyContent={t('Set the volume metadata to use the volume as a bootable image.')}
            helpIconClassName="add-bootable-volume-modal__title-help-text-icon"
            position={PopoverPosition.right}
          />
        </Title>
        <VolumeMetadata
          bootableVolume={bootableVolume}
          deleteLabel={deleteLabel}
          setBootableVolumeField={setBootableVolumeField}
        />
      </Stack>
    </TabModal>
  );
};

export default CreateBootableVolumeModal;
