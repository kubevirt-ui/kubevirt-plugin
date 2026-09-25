import { type FC } from 'react';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { getDataVolumeTemplates, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';
import DiskList from '@virtualmachines/details/tabs/configuration/storage/components/tables/disk/DiskList';
import { useVMWizardForm } from '@virtualmachines/wizard/form/VMWizardFormProvider';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const CustomizeInstanceTypeStorageTab: FC = () => {
  const { getValues } = useVMWizardForm();
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) {
    return <Loading />;
  }

  return (
    <Grid hasGutter>
      <GridItem>
        <PageSection>
          <DiskList
            customize
            getCurrentVM={() => getValues('customization.vmDraft')}
            onDiskUpdate={(updatedVM: V1VirtualMachine) => {
              const currentVM = getValues('customization.vmDraft');
              if (!currentVM) return Promise.resolve(updatedVM);

              const vmModified = replaceDraft(
                produce(currentVM, (draft) => {
                  ensurePath(draft, 'spec.template.spec.domain.devices');
                  draft.spec.template.spec.domain.devices.disks = getDisks(updatedVM);
                  draft.spec.template.spec.volumes = getVolumes(updatedVM);
                  draft.spec.dataVolumeTemplates = getDataVolumeTemplates(updatedVM);
                }),
                currentVM,
              );

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
          <EnvironmentForm
            updateVM={async (updatedVM) => replaceDraft(updatedVM, vm) ?? updatedVM}
            vm={vm}
          />
        </PageSection>
      </GridItem>
    </Grid>
  );
};

export default CustomizeInstanceTypeStorageTab;
