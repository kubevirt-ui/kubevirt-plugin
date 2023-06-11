import React, { FC, useEffect, useState } from 'react';

import SelectInstanceTypeSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/SelectInstanceTypeSection';
import VMDetailsSection from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/VMDetailsSection';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Card, Divider, Grid, GridItem, List } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import BootableVolumeList from './components/BootableVolumeList/BootableVolumeList';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import { useInstanceTypeVMStore } from './state/useInstanceTypeVMStore';
import { INSTANCE_TYPES_SECTIONS } from './utils/constants';

import './CreateFromInstanceType.scss';

const CreateFromInstanceType: FC = () => {
  const { t } = useKubevirtTranslation();
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);

  const { resetInstanceTypeVMState } = useInstanceTypeVMStore();

  useEffect(() => resetInstanceTypeVMState(), [resetInstanceTypeVMState]);

  return (
    <>
      <Grid className="co-dashboard-body">
        <GridItem>
          <Card>
            <List className="create-vm-instance-type-section__list" isPlain>
              <SectionListItem
                headerAction={<AddBootableVolumeButton />}
                headerText={t('Select volume to boot from')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_VOLUME}
                sectionState={sectionState}
              >
                <BootableVolumeList displayShowAllButton />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('Select InstanceType')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                sectionState={sectionState}
              >
                <SelectInstanceTypeSection />
              </SectionListItem>

              <Divider className="create-vm-instance-type-section__divider" />

              <SectionListItem
                headerText={t('VirtualMachine details')}
                sectionKey={INSTANCE_TYPES_SECTIONS.VM_DETAILS}
                sectionState={sectionState}
              >
                <VMDetailsSection />
              </SectionListItem>
            </List>
          </Card>
        </GridItem>
      </Grid>
      <CreateVMFooter />
    </>
  );
};

export default CreateFromInstanceType;
