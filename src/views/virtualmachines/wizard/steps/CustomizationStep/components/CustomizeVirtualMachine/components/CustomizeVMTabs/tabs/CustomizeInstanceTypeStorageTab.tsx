import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';
import DiskList from '@virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskList';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { patchWizardCustomizedVM } from '@virtualmachines/wizard/utils/patchWizardCustomizedVM';

import useUpdateCustomizeInstanceTypeTab from '../hooks/useUpdateCustomizeInstanceTypeTab';

const CustomizeInstanceTypeStorageTab: FC = () => {
  const { getValues, setValue } = useVMWizard();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const { updateVMFromForm } = useUpdateCustomizeInstanceTypeTab();

  if (!vm) {
    return <Loading />;
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <PageSection>
          <DiskList
            customize
            getCurrentVM={() => getValues(CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM)}
            onDiskUpdate={(updatedVM: V1VirtualMachine) => {
              const diskPatches = [
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
              ];

              const vmModified = patchWizardCustomizedVM(getValues, setValue, diskPatches);

              return Promise.resolve(vmModified ?? updatedVM);
            }}
            vm={vm}
          />
        </PageSection>
      </GridItem>
      <GridItem>
        <Divider />
      </GridItem>
      <GridItem>
        <PageSection>
          <EnvironmentForm updateVM={updateVMFromForm} vm={vm} />
        </PageSection>
      </GridItem>
    </Grid>
  );
};

export default CustomizeInstanceTypeStorageTab;
