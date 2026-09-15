import { type FC, useCallback, useMemo, useState } from 'react';

import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  DEFAULT_PREFERENCE_LABEL,
} from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import {
  type CategoryDetails,
  type InstanceTypeCategory,
} from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/types';
import { categoryDetailsMap } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/utils/utils';

import { type BootableResource, type BootableVolumeMetadata } from '../../utils/types';
import { changeBootableVolumeMetadata } from '../../utils/utils';
import EditBootableVolumeDescriptionField from './EditBootableVolumeDescriptionField';
import EditBootableVolumeInstanceTypeFields from './EditBootableVolumeInstanceTypeFields';
import EditBootableVolumePreferenceField from './EditBootableVolumePreferenceField';

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
    (): string[] =>
      Object.keys(convertResourceArrayToMap(preferences)).sort((a, b) => a.localeCompare(b)),
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
  const [instanceType, setInstanceType] = useState<string>(initialParams.instanceType?.[0] ?? '');
  const [size, setSize] = useState<string>(initialParams.size ?? '');
  const [description, setDescription] = useState<string>(initialParams.description ?? '');

  const selectedCategory: CategoryDetails | undefined = instanceType
    ? categoryDetailsMap[instanceType as InstanceTypeCategory]
    : undefined;
  const instanceTypes = selectedCategory?.instanceTypes;

  const onInstanceTypeSelect = (_event: unknown, newInstanceType: string): void => {
    setInstanceType(newInstanceType);

    const newCategoryObject = categoryDetailsMap[newInstanceType as InstanceTypeCategory];
    const newCategorySize = newCategoryObject.instanceTypes[0].label;
    setSize(newCategorySize);
  };

  const onSizeSelect = (_event: unknown, newSize: string): void => {
    setSize(newSize);
  };

  const onSubmitVolumeParams = useCallback((): ReturnType<typeof changeBootableVolumeMetadata> => {
    const preferenceLabel = preference && { [DEFAULT_PREFERENCE_LABEL]: preference };

    const categoryObject = categoryDetailsMap[instanceType as InstanceTypeCategory];
    const instanceLabel = instanceType && {
      [DEFAULT_INSTANCETYPE_LABEL]: `${categoryObject.prefix}.${size}`,
    };

    const descriptionAnnotation = description?.trim()
      ? { [ANNOTATIONS.description]: description.trim() }
      : { [ANNOTATIONS.description]: undefined };

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
      shouldWrapInForm
    >
      <EditBootableVolumePreferenceField
        preference={preference}
        preferencesNames={preferencesNames}
        setPreference={setPreference}
      />
      <EditBootableVolumeInstanceTypeFields
        instanceType={instanceType}
        instanceTypes={instanceTypes}
        onInstanceTypeSelect={onInstanceTypeSelect}
        onSizeSelect={onSizeSelect}
        size={size}
      />
      <EditBootableVolumeDescriptionField
        description={description}
        setDescription={setDescription}
      />
    </TabModal>
  );
};

export default EditBootableVolumesModal;
