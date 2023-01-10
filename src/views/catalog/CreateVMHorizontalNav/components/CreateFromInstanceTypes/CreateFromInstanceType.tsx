import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Card, Divider, Grid, GridItem, List } from '@patternfly/react-core';

import AddBootableVolumeButton from './components/AddBootableVolumeButton/AddBootableVolumeButton';
import CreateVMFooter from './components/CreateVMFooter/CreateVMFooter';
import SectionListItem from './components/SectionListItem/SectionListItem';
import useInstanceTypesAndPreferences from './hooks/useInstanceTypesAndPreferences';
import { INSTANCE_TYPES_SECTIONS } from './utils/constants';

import './CreateFromInstanceType.scss';

const CreateFromInstanceType: FC<RouteComponentProps<{ ns: string }>> = () => {
  const sectionState = useState<INSTANCE_TYPES_SECTIONS>(INSTANCE_TYPES_SECTIONS.SELECT_VOLUME);
  const { preferences, instanceTypes, loaded } = useInstanceTypesAndPreferences();
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
                    preferencesNames={(preferences || []).map(getName)}
                    instanceTypesNames={(instanceTypes || []).map(getName)}
                    loaded={loaded}
                  />
                }
              >
                <div>Placeholder for BootableVolumesTable</div>
              </SectionListItem>
              <Divider inset={{ default: 'insetLg' }} />
              <SectionListItem
                headerText={t('Select InstanceType')}
                sectionKey={INSTANCE_TYPES_SECTIONS.SELECT_INSTANCE_TYPE}
                sectionState={sectionState}
              >
                <div>Placeholder for InstanceTypesCards</div>
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
      <CreateVMFooter />
    </>
  );
};

export default CreateFromInstanceType;
