import React, { FC, useCallback, useMemo, useState } from 'react';

import FilterSelect from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/FilterSelect/FilterSelect';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, Grid, GridItem, PopoverPosition, TextArea } from '@patternfly/react-core';

import { BootableVolumeMetadata } from '../../utils/types';
import { changeBootableVolumeMetadata, getInstanceTypesToSizesMap } from '../../utils/utils';

type EditBootableVolumesModalProps = {
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
  preferences: V1alpha2VirtualMachineClusterPreference[];
  instanceTypesNames: string[];
};

const EditBootableVolumesModal: FC<EditBootableVolumesModalProps> = ({
  dataSource,
  isOpen,
  onClose,
  preferences,
  instanceTypesNames,
}) => {
  const { t } = useKubevirtTranslation();
  const preferencesNames = useMemo(
    () => Object.keys(convertResourceArrayToMap(preferences)).sort((a, b) => a.localeCompare(b)),
    [preferences],
  );

  const instanceTypesToSizesMap = useMemo(
    () => getInstanceTypesToSizesMap(instanceTypesNames),
    [instanceTypesNames],
  );

  const initialParams = useMemo(() => {
    const instanceTypeLabel =
      dataSource?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL]?.split('.');

    return {
      preference: dataSource?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      instanceType: instanceTypeLabel?.[0],
      size: instanceTypeLabel?.[1],
      description: dataSource?.metadata?.annotations?.[ANNOTATIONS.description],
    };
  }, [dataSource]);

  const [preference, setPreference] = useState<string>(initialParams.preference);
  const [instanceType, setInstanceType] = useState<string>(initialParams.instanceType);
  const [size, setSize] = useState<string>(initialParams.size);
  const [description, setDescription] = useState<string>(initialParams.description);

  const sizeOptions = useMemo(
    () => instanceTypesToSizesMap[instanceType] || [],
    [instanceType, instanceTypesToSizesMap],
  );

  const onInstanceTypeChange = useCallback(
    (instanceTypeName: string) => {
      setInstanceType(instanceTypeName);
      setSize(instanceTypesToSizesMap[instanceTypeName][0]);
    },
    [instanceTypesToSizesMap],
  );

  const onChangeVolumeParams = useCallback(() => {
    const preferenceLabel = preference && { [DEFAULT_PREFERENCE_LABEL]: preference };
    const instanceLabel = instanceType && {
      [DEFAULT_INSTANCETYPE_LABEL]: `${instanceType}.${size}`,
    };
    const descriptionAnnotation = description?.trim()
      ? { [ANNOTATIONS.description]: description.trim() }
      : { [ANNOTATIONS.description]: undefined }; // we do want undefined here to get the annotation removed from the resource, if description not provided

    const metadata: BootableVolumeMetadata = {
      labels: {
        ...dataSource?.metadata?.labels,
        ...preferenceLabel,
        ...instanceLabel,
      },
      annotations: {
        ...dataSource?.metadata?.annotations,
        ...descriptionAnnotation,
      },
    };

    return changeBootableVolumeMetadata(dataSource, metadata);
  }, [dataSource, description, instanceType, preference, size]);

  return (
    <TabModal<K8sResourceCommon>
      obj={dataSource}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Edit volume metadata')}
      onSubmit={onChangeVolumeParams()}
    >
      <Form>
        <FormGroup
          label={
            <>
              {t('Preference')}{' '}
              <HelpTextIcon
                bodyContent={t('The default set of preferences to associate with the volume')}
                position={PopoverPosition.right}
              />
            </>
          }
          isRequired
        >
          <FilterSelect
            selected={preference}
            setSelected={setPreference}
            options={preferencesNames}
            groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
            optionLabelText={t('preference')}
          />
        </FormGroup>
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup
              label={
                <>
                  {t('Default InstanceType')}{' '}
                  <HelpTextIcon
                    bodyContent={t(
                      'The default hardware profile that is best suited for your workload',
                    )}
                    position={PopoverPosition.right}
                  />
                </>
              }
            >
              <FilterSelect
                selected={instanceType}
                setSelected={onInstanceTypeChange}
                options={Object.keys(instanceTypesToSizesMap) || []}
                groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
                optionLabelText={t('InstanceType')}
              />
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label={t('Size')}>
              <FilterSelect
                selected={size}
                setSelected={setSize}
                options={sizeOptions}
                groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
                optionLabelText={t('size')}
              />
            </FormGroup>
          </GridItem>
        </Grid>
        <FormGroup label={t('Description')}>
          <TextArea
            value={description}
            onChange={setDescription}
            resizeOrientation="vertical"
            aria-label={t('description text area')}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EditBootableVolumesModal;
