import React, { FC, useMemo, useState } from 'react';

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
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS } from '@kubevirt-utils/resources/template';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextArea } from '@patternfly/react-core';

import { BootableVolumeMetadata } from '../../utils/types';
import { changeBootableVolumeMetadata } from '../../utils/utils';

type EditBootableVolumesModallProps = {
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
  preferences: V1alpha2VirtualMachineClusterPreference[];
  instanceTypesNames: string[];
};

const EditBootableVolumesModal: FC<EditBootableVolumesModallProps> = ({
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
  const initialMetadata: BootableVolumeMetadata = useMemo(() => {
    return {
      labels: dataSource?.metadata?.labels,
      annotations: dataSource?.metadata?.annotations,
    };
  }, [dataSource]);
  const [metadata, setMetadata] = useState<BootableVolumeMetadata>(initialMetadata);

  const setBootableVolumeMetadata = (key: string, fieldKey: string) => (value: string) =>
    setMetadata((prevState) => ({
      ...prevState,
      [key]: { ...prevState[key], [fieldKey]: value },
    }));

  return (
    <TabModal<K8sResourceCommon>
      obj={dataSource}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('Edit')}
      onSubmit={changeBootableVolumeMetadata(dataSource, initialMetadata, metadata)}
    >
      <Form>
        <FormGroup label={t('Default preference')} isRequired>
          <FilterSelect
            selected={metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]}
            setSelected={setBootableVolumeMetadata('labels', DEFAULT_PREFERENCE_LABEL)}
            options={preferencesNames}
            groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
            optionLabelText={t('preference')}
          />
        </FormGroup>
        <FormGroup label={t('Default Instancetype')}>
          <FilterSelect
            selected={metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL]}
            setSelected={setBootableVolumeMetadata('labels', DEFAULT_INSTANCETYPE_LABEL)}
            options={instanceTypesNames}
            groupVersionKind={VirtualMachineClusterInstancetypeModelGroupVersionKind}
            optionLabelText={t('Instancetype')}
          />
        </FormGroup>
        <FormGroup label={t('Description')}>
          <TextArea
            value={metadata?.annotations?.description}
            onChange={setBootableVolumeMetadata('annotations', ANNOTATIONS?.description)}
            resizeOrientation="vertical"
            aria-label={t('description text area')}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EditBootableVolumesModal;
