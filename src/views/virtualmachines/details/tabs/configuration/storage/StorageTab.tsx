import React, { FC } from 'react';

import EnvironmentForm from '@kubevirt-utils/components/EnvironmentEditor/EnvironmentForm';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Alert,
  AlertActionCloseButton,
  Divider,
  Grid,
  GridItem,
  PageSection,
} from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import { useUploadAlert } from './components/hooks/useUploadAlert';
import DiskList from './components/tables/disk/DiskList';

const StorageTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { alertConfig, dismissAlert, onUploadStarted, uploadError } = useUploadAlert();

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={[...PATHS_TO_HIGHLIGHT.DISKS_TAB, ...PATHS_TO_HIGHLIGHT.ENV_TAB]}
      resource={vm}
    >
      {alertConfig && (
        <Alert
          actionClose={<AlertActionCloseButton onClose={dismissAlert} />}
          className="pf-v6-u-mb-md"
          isInline
          title={t(alertConfig.title)}
          variant={alertConfig.variant}
        >
          {t(alertConfig.body)}
          {uploadError && ` ${uploadError}`}
        </Alert>
      )}
      <Grid hasGutter>
        <GridItem>
          <PageSection>
            <DiskList onUploadStarted={onUploadStarted} vm={vm} vmi={vmi} />
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
};

export default StorageTab;
