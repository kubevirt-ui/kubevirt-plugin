import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import {
  updateCustomizeInstanceType,
  updateVMCustomizeIT,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';
import DiskList from '@virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskList';

const CustomizeInstanceTypeStorageTab = () => {
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <PageSection>
          <DiskList
            onDiskUpdate={(updatedVM: V1VirtualMachine) => {
              const vmModified = updateCustomizeInstanceType([
                {
                  data: getDisks(updatedVM),
                  path: `spec.template.spec.domain.devices.disks`,
                },
                {
                  data: getVolumes(updatedVM),
                  path: `spec.template.spec.volumes`,
                },
                {
                  data: getDataVolumeTemplates(updatedVM),
                  path: `spec.dataVolumeTemplates`,
                },
              ]);

              return Promise.resolve(vmModified);
            }}
            customize
            vm={vm}
          />
        </PageSection>
      </GridItem>
      <GridItem>
        <Divider />
      </GridItem>
      <GridItem>
        <PageSection>
          <EnvironmentForm updateVM={updateVMCustomizeIT} vm={vm} />
        </PageSection>
      </GridItem>
    </Grid>
  );
};

export default CustomizeInstanceTypeStorageTab;
