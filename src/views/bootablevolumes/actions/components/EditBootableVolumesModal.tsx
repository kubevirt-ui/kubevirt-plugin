import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';

import FilterSelect from '@catalog/CreateFromInstanceTypes/components/AddBootableVolumeModal/components/FilterSelect/FilterSelect';
import {
  CategoryDetails,
  InstanceTypeCategory,
} from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/utils';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  Select,
  SelectOption,
  SelectVariant,
  TextArea,
} from '@patternfly/react-core';

import { BootableResource, BootableVolumeMetadata } from '../../utils/types';
import { changeBootableVolumeMetadata } from '../../utils/utils';

type EditBootableVolumesModalProps = {
  source: BootableResource;
  isOpen: boolean;
  onClose: () => void;
  preferences: V1alpha2VirtualMachineClusterPreference[];
};

const EditBootableVolumesModal: FC<EditBootableVolumesModalProps> = ({
  source,
  isOpen,
  onClose,
  preferences,
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
      preference: source?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL],
      instanceType: initialCategory,
      size: initialCategory && instanceTypeLabel?.[1],
      description: source?.metadata?.annotations?.[ANNOTATIONS.description],
    };
  }, [source]);

  const [preference, setPreference] = useState<string>(initialParams.preference);
  const [isInstanceTypeOpen, setIsInstanceTypeOpen] = useState(false);
  const [instanceType, setInstanceType] = useState<string>(initialParams.instanceType?.[0]);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [size, setSize] = useState<string>(initialParams.size);
  const [description, setDescription] = useState<string>(initialParams.description);

  // update options for 'Size' dropdown according to chosen 'instanceType' in 'Default InstanceType' dropdown
  const { instanceTypes }: CategoryDetails = useMemo(
    () => (instanceType ? categoryDetailsMap[instanceType] : {}),
    [instanceType],
  );

  const onInstanceTypeSelect = (
    _event: ChangeEvent<HTMLSelectElement>,
    newInstanceType: string,
  ) => {
    setInstanceType(newInstanceType);
    setIsInstanceTypeOpen(false);

    const newCategoryObject = categoryDetailsMap[newInstanceType];
    const newCategorySize = newCategoryObject.instanceTypes[0].label;
    setSize(newCategorySize);
  };

  const onSizeSelect = (_event: ChangeEvent<HTMLSelectElement>, newSize: string) => {
    setSize(newSize);
    setIsSizeOpen(false);
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
      labels: {
        ...source?.metadata?.labels,
        ...preferenceLabel,
        ...instanceLabel,
      },
      annotations: {
        ...source?.metadata?.annotations,
        ...descriptionAnnotation,
      },
    };

    return changeBootableVolumeMetadata(source, metadata);
  }, [source, description, instanceType, preference, size]);

  return (
    <TabModal<K8sResourceCommon>
      obj={source}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Edit volume metadata')}
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
                      href={
                        'https://kubevirt.io/user-guide/virtual_machines/instancetypes/#virtualmachinepreference'
                      }
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
                    bodyContent={t('The default InstanceType for this volume.')}
                    position={PopoverPosition.right}
                  />
                </>
              }
            >
              <Select
                menuAppendTo="parent"
                isOpen={isInstanceTypeOpen}
                onToggle={setIsInstanceTypeOpen}
                onSelect={onInstanceTypeSelect}
                variant={SelectVariant.single}
                placeholderText={t('Select InstanceType')}
                selections={instanceType}
              >
                {Object.keys(InstanceTypeCategory)?.map((instanceTypeCategory) => {
                  const { seriesLabel, title }: CategoryDetails =
                    categoryDetailsMap[instanceTypeCategory];
                  return (
                    <SelectOption
                      key={instanceTypeCategory}
                      value={instanceTypeCategory}
                      description={title}
                    >
                      {seriesLabel}
                    </SelectOption>
                  );
                })}
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label={t('Size')}>
              <Select
                menuAppendTo="parent"
                isOpen={isSizeOpen}
                onToggle={setIsSizeOpen}
                onSelect={onSizeSelect}
                variant={SelectVariant.single}
                placeholderText={t('Select size')}
                selections={size}
              >
                {instanceTypes?.map(({ label, cpus, memory }) => (
                  <SelectOption
                    key={label}
                    value={label}
                    description={t('{{cpus}} CPUs, {{memory}} Memory', {
                      cpus,
                      memory: readableSizeUnit(memory),
                    })}
                  >
                    {label}
                  </SelectOption>
                ))}
              </Select>
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
