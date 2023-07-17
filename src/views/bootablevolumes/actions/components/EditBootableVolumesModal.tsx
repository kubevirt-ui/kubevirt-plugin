import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';

import {
  CategoryDetails,
  InstanceTypeCategory,
} from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/utils/utils';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import FilterSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/FilterSelect/FilterSelect';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
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
  Select,
  SelectOption,
  SelectVariant,
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
            groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
            optionLabelText={t('preference')}
            options={preferencesNames}
            selected={preference}
            setSelected={setPreference}
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
                isOpen={isInstanceTypeOpen}
                menuAppendTo="parent"
                onSelect={onInstanceTypeSelect}
                onToggle={setIsInstanceTypeOpen}
                placeholderText={t('Select InstanceType')}
                selections={instanceType}
                variant={SelectVariant.single}
              >
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
              </Select>
            </FormGroup>
          </GridItem>
          <GridItem span={6}>
            <FormGroup label={t('Size')}>
              <Select
                isOpen={isSizeOpen}
                menuAppendTo="parent"
                onSelect={onSizeSelect}
                onToggle={setIsSizeOpen}
                placeholderText={t('Select size')}
                selections={size}
                variant={SelectVariant.single}
              >
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
              </Select>
            </FormGroup>
          </GridItem>
        </Grid>
        <FormGroup label={t('Description')}>
          <TextArea
            aria-label={t('description text area')}
            onChange={setDescription}
            resizeOrientation="vertical"
            value={description}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EditBootableVolumesModal;
