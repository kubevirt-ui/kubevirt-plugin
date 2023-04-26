import React, { FC, useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import VMDetailsSection from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/VMDetailsSection';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, Divider, Grid, GridItem, List } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useBootableVolumes from './hooks/useBootableVolumes';
import useInstanceTypesAndPreferences from './hooks/useInstanceTypesAndPreferences';
import {
  DEFAULT_INSTANCETYPE_LABEL,
  initialInstanceTypeState,
  INSTANCE_TYPES_SECTIONS,
  InstanceTypeState,
} from './utils/constants';
import { generateVM, getInstanceTypeState } from './utils/utils';

import './CreateFromInstanceType.scss';

const CreateFromInstanceType: FC = () => {
  const [ns] = useActiveNamespace();
  const history = useHistory();

  const bootableVolumesResources = useBootableVolumes();
  const { preferences, loadError } = useInstanceTypesAndPreferences();
  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);

  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);

  const [selectedBootableVolume, setSelectedBootableVolume] = useState<V1beta1DataSource>();
  const [selectedInstanceType, setSelectedInstanceType] =
    useState<InstanceTypeState>(initialInstanceTypeState);
  const [vmName, setVMName] = useState<string>(
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
    }),
  );
  const [sshSecretCredentials, setSSHSecretCredentials] = useState<SSHSecretCredentials>({
    sshSecretName: '',
    sshSecretKey: '',
  });
  const [pvcSource, setPVCSource] = useState<V1alpha1PersistentVolumeClaim>();

  const namespace = ns === ALL_NAMESPACES_SESSION_KEY ? DEFAULT_NAMESPACE : ns;

  const onSelectVolume = useCallback(
    (selectedVolume: V1beta1DataSource) => {
      const { name: pvcName, namespace: pvcNamespace } = selectedVolume?.spec?.source?.pvc || {};
      const defaultInstanceTypeName =
        selectedVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL];
      const instanceType = defaultInstanceTypeName
        ? getInstanceTypeState(defaultInstanceTypeName)
        : initialInstanceTypeState;

      setSelectedBootableVolume(selectedVolume);
      setPVCSource(bootableVolumesResources?.pvcSources?.[pvcNamespace]?.[pvcName]);
      setSelectedInstanceType(instanceType);
    },
    [bootableVolumesResources?.pvcSources],
  );

  return (
    <>
      <Grid className="co-dashboard-body">
        <GridItem>
          <Card>
            <List className="create-vm-instance-type-section__list" isPlain>
              <SectionListItem
                headerText={t('Select volume to boot from')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                sectionState={sectionState}
                headerAction={
                  <AddBootableVolumeButton
                    preferencesNames={Object.keys(preferencesMap)}
                    loadError={loadError}
                  />
                }
              >
                <BootableVolumeList
                  preferences={preferencesMap}
                  bootableVolumeSelectedState={[selectedBootableVolume, onSelectVolume]}
                  bootableVolumesResources={bootableVolumesResources}
                  displayShowAllButton
                />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('Select InstanceType')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                sectionState={sectionState}
              >
                <SelectInstanceTypeSection
                  selectedInstanceType={selectedInstanceType}
                  setSelectedInstanceType={setSelectedInstanceType}
                />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('VirtualMachine details')}
                sectionKey={INSTANCE_TYPES_SECTIONS.VM_DETAILS}
                sectionState={sectionState}
              >
                <VMDetailsSection
                  namespace={namespace}
                  vmName={vmName}
                  setVMName={setVMName}
                  bootSource={selectedBootableVolume}
                  instancetype={selectedInstanceType}
                  sshSecretCredentials={sshSecretCredentials}
                  setSSHSecretCredentials={setSSHSecretCredentials}
                  pvcSource={pvcSource}
                />
              </SectionListItem>
            </List>
          </Card>
        </GridItem>
      </Grid>
      <CreateVMFooter
        vm={generateVM(
          selectedBootableVolume,
          ns,
          selectedInstanceType?.name,
          vmName,
          pvcSource?.spec?.storageClassName,
        )}
        onCancel={() => {
          history.push(getResourceUrl({ model: VirtualMachineModel, activeNamespace: ns }));
        }}
        selectedBootableVolume={selectedBootableVolume}
        sshSecretCredentials={sshSecretCredentials}
      />
    </>
  );
};

export default CreateFromInstanceType;
