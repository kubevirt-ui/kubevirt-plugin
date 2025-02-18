import React, { FC } from 'react';

import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import DiskList from './components/tables/disk/DiskList';

const StorageTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => (
  <SidebarEditor
    onResourceUpdate={onSubmitYAML}
    pathsToHighlight={[...PATHS_TO_HIGHLIGHT.DISKS_TAB, ...PATHS_TO_HIGHLIGHT.ENV_TAB]}
    resource={vm}
  >
    <Grid hasGutter>
      <GridItem>
        <PageSection>
          <DiskList vm={vm} vmi={vmi} />
        </PageSection>
      </GridItem>
      <GridItem>
        <Divider />
      </GridItem>
      <GridItem>
        <PageSection>
          <EnvironmentForm updateVM={onSubmitYAML} vm={vm} />
        </PageSection>
      </GridItem>
    </Grid>
  </SidebarEditor>
);

export default StorageTab;
