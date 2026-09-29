import { type FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, PageSection, Stack, Title } from '@patternfly/react-core';
import SSHTabAuthorizedSSHKey from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabAuthorizedSSHKey';
import SSHTabSSHAccess from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabSSHAccess';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const CustomizeInstanceTypeSSHTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) return <Loading />;

  return (
    <PageSection>
      <Title headingLevel="h2">
        <SearchItem id="ssh">{t('SSH settings')} </SearchItem>
      </Title>
      <Grid span={6}>
        <GridItem>
          <Stack hasGutter>
            <SSHTabSSHAccess isCustomizeInstanceType vm={vm} />
            <SSHTabAuthorizedSSHKey
              isCustomizeInstanceType
              onUpdateVM={async (updatedVM) => replaceDraft(updatedVM) ?? updatedVM}
              vm={vm}
            />
          </Stack>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeSSHTab;
