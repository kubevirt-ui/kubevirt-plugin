import React, { FC } from 'react';

import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { Grid, GridItem, PageSection, Stack, Title } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import SSHTabAuthorizedSSHKey from './components/SSHTabAuthorizedSSHKey';
import SSHTabSSHAccess from './components/SSHTabSSHAccess';

const SSHTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
      resource={vm}
    >
      <PageSection>
        <Title headingLevel="h2">{t('SSH')}</Title>
        <Grid span={6}>
          <GridItem>
            <Stack hasGutter>
              <SSHTabSSHAccess vm={vm} vmi={vmi} />
              <SSHTabAuthorizedSSHKey vm={vm} />
            </Stack>
          </GridItem>
        </Grid>
      </PageSection>
    </SidebarEditor>
  );
};

export default SSHTab;
