import type { FC } from 'react';
import React from 'react';

import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import useIsVMEditable from '@kubevirt-utils/components/VMEditPermissionContext/useIsVMEditable';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { Divider, Grid, GridItem, PageSection } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import type { ConfigurationInnerTabProps } from '../utils/types';
import DiskList from './components/tables/disk/DiskList';

const StorageTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const isEditable = useIsVMEditable();

  return (
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
            <EnvironmentForm isEditable={isEditable} updateVM={onSubmitYAML} vm={vm} />
          </PageSection>
        </GridItem>
      </Grid>
    </SidebarEditor>
  );
};

export default StorageTab;
