import React, { FC, MouseEvent, useCallback, useMemo, useState } from 'react';

import {
  CategoryDetails,
  InstanceTypeCategory,
} from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/utils';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/resources/bootableresources/constants';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Form,
  FormGroup,
  Grid,
  GridItem,
  PopoverPosition,
  SelectOption,
  TextArea,
} from '@patternfly/react-core';

import { BootableResource, BootableVolumeMetadata } from '../../utils/types';
import { changeBootableVolumeMetadata } from '../../utils/utils';

type EditBootableVolumesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  preferences: V1beta1VirtualMachineClusterPreference[];
  source: BootableResource;
};

const EditBootableVolumesModal: FC<EditBootableVolumesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  source,
}) => {
  const { t } = useKubevirtTranslation();

  const preferencesNames = useMemo(
    () => Object.keys(convertResourceArrayToMap(preferences)).sort((a, b) => a.localeCompare(b)),
    [preferences],
  );

  const initialParams = useMemo(() => {
    const instanceTypeLabel = source?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL]?.split('.');
    const initialCategory = Object.entries(categoryDetailsMap).find(
      (category) => category[1].prefix === instanceTypeLabel?.[0],
    );

    return {
      description: source?.metadata?.annotations?.[ANNOTATIONS.description],
      instanceType: initialCategory,
      preference: source?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      size: initialCategory && instanceTypeLabel?.[1],
    };
  }, [source]);

  const [preference, setPreference] = useState<string>(initialParams.preference);
  const [instanceType, setInstanceType] = useState<string>(initialParams.instanceType?.[0]);
  const [size, setSize] = useState<string>(initialParams.size);
  const [description, setDescription] = useState<string>(initialParams.description);

  // update options for 'Size' dropdown according to chosen 'instanceType' in 'Default InstanceType' dropdown
  const { instanceTypes }: CategoryDetails = useMemo(
    () => (instanceType ? categoryDetailsMap[instanceType] : {}),
    [instanceType],
  );

  const onInstanceTypeSelect = (_event: MouseEvent<HTMLSelectElement>, newInstanceType: string) => {
    setInstanceType(newInstanceType);

    const newCategoryObject = categoryDetailsMap[newInstanceType];
    const newCategorySize = newCategoryObject.instanceTypes[0].label;
    setSize(newCategorySize);
  };

  const onSizeSelect = (_event: MouseEvent<HTMLSelectElement>, newSize: string) => {
    setSize(newSize);
  };

  const onSubmitVolumeParams = useCallback(() => {
    const preferenceLabel = preference && { [DEFAULT_PREFERENCE_LABEL]: preference };

    const categoryObject = categoryDetailsMap[instanceType];
    const instanceLabel = instanceType && {
      [DEFAULT_INSTANCETYPE_LABEL]: `${categoryObject.prefix}.${size}`,
    };

    const descriptionAnnotation = description?.trim()
      ? { [ANNOTATIONS.description]: description.trim() }
      : { [ANNOTATIONS.description]: undefined }; // we do want undefined here to get the annotation removed from the resource, if description not provided

    const metadata: BootableVolumeMetadata = {
      annotations: {
        ...source?.metadata?.annotations,
        ...descriptionAnnotation,
      },
      labels: {
        ...source?.metadata?.labels,
        ...preferenceLabel,
        ...instanceLabel,
      },
    };

    return changeBootableVolumeMetadata(source, metadata);
  }, [source, description, instanceType, preference, size]);

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Edit volume metadata')}
      isOpen={isOpen}
      obj={source}
      onClose={onClose}
      onSubmit={onSubmitVolumeParams()}
    >
      <Form>
        <FormGroup
          label={
            <>
              {t('Preference')}{' '}
              <HelpTextIcon
                bodyContent={
                  <>
                    {t(
                      'The preferred VirtualMachine attribute values required to run a given workload.',
                    )}{' '}
                    <ExternalLink
                      href={documentationURL.INSTANCE_TYPES_USER_GUIDE}
                      text={t('Read more')}
                    />
                  </>
                }
                position={PopoverPosition.right}
              />
            </>
          }
          isRequired
        >
          <InlineFilterSelect
            options={preferencesNames?.map((opt) => ({
              children: opt,
              groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
              value: opt,
            }))}
            selected={preference}
            setSelected={setPreference}
            toggleProps={{ placeholder: t('Select preference') }}
          />
        </FormGroup>
        <Grid hasGutter>
          <GridItem span={6}>
            <FormGroup
              label={
                <>
                  {t('Default InstanceType')}{' '}
                  <HelpTextIcon
                    bodyContent={t('The default InstanceType for this volume.')}
                    position={PopoverPosition.right}
                  />
                </>
              }
            >
              <FormPFSelect onSelect={onInstanceTypeSelect} selected={instanceType}>
                {Object.keys(InstanceTypeCategory)?.map((instanceTypeCategory) => {
                  const { seriesLabel, title }: CategoryDetails =
                    categoryDetailsMap[instanceTypeCategory];
                  return (
                    <SelectOption
                      description={title}
                      key={instanceTypeCategory}
                      value={instanceTypeCategory}
                    >
                      {seriesLabel}
                    </SelectOption>
                  );
                })}
              </FormPFSelect>
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label={t('Size')}>
              <FormPFSelect onSelect={onSizeSelect} selected={size}>
                {instanceTypes?.map(({ cpus, label, memory }) => (
                  <SelectOption
                    description={t('{{cpus}} CPUs, {{memory}} Memory', {
                      cpus,
                      memory: readableSizeUnit(memory),
                    })}
                    key={label}
                    value={label}
                  >
                    {label}
                  </SelectOption>
                ))}
              </FormPFSelect>
            </FormGroup>
          </GridItem>
        </Grid>
        <FormGroup label={t('Description')}>
          <TextArea
            aria-label={t('description text area')}
            onChange={(_event, val) => setDescription(val)}
            resizeOrientation="vertical"
            value={description}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EditBootableVolumesModal;
