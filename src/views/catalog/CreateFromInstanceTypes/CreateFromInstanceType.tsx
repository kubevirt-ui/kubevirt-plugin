import React, { FC, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap, getName } from '@kubevirt-utils/resources/shared';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import { Card, Divider, Grid, GridItem, List } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useInstanceTypesAndPreferences from './hooks/useInstanceTypesAndPreferences';
import {
  initialInstanceTypeState,
  INSTANCE_TYPES_SECTIONS,
  InstanceTypeState,
} from './utils/constants';
import { produceVirtualMachine } from './utils/utils';

import './CreateFromInstanceType.scss';

const CreateFromInstanceType: FC<RouteComponentProps<{ ns: string }>> = () => {
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);
  const [selectedBootableVolume, setSelectedBootableVolume] = useState<V1beta1DataSource>();
  const [selectedInstanceType, setSelectedInstanceType] =
    useState<InstanceTypeState>(initialInstanceTypeState);

  const [ns] = useActiveNamespace();
  const { preferences, instanceTypes, loaded, loadError } = useInstanceTypesAndPreferences();
  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);
  return (
    <>
      <Grid className="co-dashboard-body">
        <GridItem>
          <Card>
            <List isPlain>
              <SectionListItem
                headerText={t('Select bootable Volume')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                sectionState={sectionState}
                headerAction={
                  <AddBootableVolumeButton
                    preferencesNames={Object.keys(preferencesMap)}
                    instanceTypesNames={(instanceTypes || []).map(getName)}
                    loaded={loaded}
                    loadError={loadError}
                  />
                }
              >
                <BootableVolumeList
                  preferences={preferencesMap}
                  bootableVolumeSelectedState={[selectedBootableVolume, setSelectedBootableVolume]}
                  displayShowAllButton
                />
              </SectionListItem>
              <Divider inset={{ default: 'insetLg' }} />
              <SectionListItem
                headerText={t('Select Instancetype')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                sectionState={sectionState}
              >
                <SelectInstanceTypeSection
                  selectedInstanceType={selectedInstanceType}
                  setSelectedInstanceType={setSelectedInstanceType}
                />
              </SectionListItem>
              <Divider inset={{ default: 'insetLg' }} />
              <SectionListItem
                headerText={t('VirtualMachine details')}
                sectionKey={INSTANCE_TYPES_SECTIONS.VM_DETAILS}
                sectionState={sectionState}
              >
                <div>Placeholder for VMReviewDetails</div>
              </SectionListItem>
            </List>
          </Card>
        </GridItem>
      </Grid>
      <CreateVMFooter
        vm={produceVirtualMachine(selectedBootableVolume, ns, selectedInstanceType.name)}
        onCancel={() => {
          setSelectedBootableVolume(null);
          setSelectedInstanceType(initialInstanceTypeState);
        }}
        selectedBootableVolume={selectedBootableVolume}
      />
    </>
  );
};

export default CreateFromInstanceType;
