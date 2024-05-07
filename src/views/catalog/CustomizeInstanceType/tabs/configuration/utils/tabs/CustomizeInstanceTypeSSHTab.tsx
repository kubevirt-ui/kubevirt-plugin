import React from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateVMCustomizeIT, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import {
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Stack,
  Title,
} from '@patternfly/react-core';
import SSHTabAuthorizedSSHKey from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabAuthorizedSSHKey';
import SSHTabSSHAccess from '@virtualmachines/details/tabs/configuration/ssh/components/SSHTabSSHAccess';

const CustomizeInstanceTypeSSHTab = () => {
  const { t } = useKubevirtTranslation();
  const vm = vmSignal.value;

  if (!vm) {
    return <Loading />;
  }

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Title headingLevel="h2">
        <SearchItem id="ssh">{t('SSH settings')} </SearchItem>
      </Title>
      <Grid span={6}>
        <GridItem>
          <Stack hasGutter>
            <SSHTabSSHAccess vm={vm} />
            <SSHTabAuthorizedSSHKey
              isCustomizeInstanceType
              onUpdateVM={updateVMCustomizeIT}
              vm={vm}
            />
          </Stack>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default CustomizeInstanceTypeSSHTab;
