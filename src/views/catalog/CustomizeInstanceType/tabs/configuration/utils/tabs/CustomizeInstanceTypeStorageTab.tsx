import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { Divider, Grid, GridItem, PageSection, PageSectionVariants } from '@patternfly/react-core';
import DiskList from '@virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskList';

const CustomizeInstanceTypeStorageTab = () => {
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <PageSection variant={PageSectionVariants.light}>
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
            vm={vm}
          />
        </PageSection>
      </GridItem>
      <GridItem>
        <Divider />
      </GridItem>
      <GridItem>
        <PageSection variant={PageSectionVariants.light}>
          <EnvironmentForm
            updateVM={(updatedVM) =>
              Promise.resolve(
                updateCustomizeInstanceType([
                  {
                    data: updatedVM,
                  },
                ]),
              )
            }
            vm={vm}
          />
        </PageSection>
      </GridItem>
    </Grid>
  );
};

export default CustomizeInstanceTypeStorageTab;
