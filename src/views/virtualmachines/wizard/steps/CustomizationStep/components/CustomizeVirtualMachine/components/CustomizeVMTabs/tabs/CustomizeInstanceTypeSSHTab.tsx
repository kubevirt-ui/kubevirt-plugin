import { type FC } from 'react';
import { useWatch } from 'react-hook-form';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, PageSection, Stack, Title } from '@patternfly/react-core';
import SSHTabAuthorizedSSHKey from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabAuthorizedSSHKey';
import SSHTabSSHAccess from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabSSHAccess';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM } from '@virtualmachines/wizard/state/vm-wizard-form/consts';

import useUpdateCustomizeInstanceTypeTab from '../hooks/useUpdateCustomizeInstanceTypeTab';

const CustomizeInstanceTypeSSHTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const vm = useWatch({ control, name: CREATE_VM_FORM_FIELDS_CUSTOMIZED_VM });

  const { updateVMFromForm } = useUpdateCustomizeInstanceTypeTab();

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="ssh">{t('SSH settings')} </SearchItem>
      </Title>
      <Grid span={6}>
        <GridItem>
          <Stack hasGutter>
            <SSHTabSSHAccess isCustomizeInstanceType vm={vm} />
            <SSHTabAuthorizedSSHKey isCustomizeInstanceType onUpdateVM={updateVMFromForm} vm={vm} />
          </Stack>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeSSHTab;
