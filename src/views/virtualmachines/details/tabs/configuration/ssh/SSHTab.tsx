import React, { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Stack,
  Title,
} from '@patternfly/react-core';

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
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h2">
          <SearchItem id="ssh">{t('SSH settings')} </SearchItem>
        </Title>
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
