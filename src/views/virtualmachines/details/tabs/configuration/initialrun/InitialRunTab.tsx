import React, { FC } from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  Divider,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';
import { ConfigurationInnerTabProps } from '../utils/types';

import InitialRunTabCloudinit from './components/InitialRunTabCloudinit';
import InitialRunTabSysprep from './components/InitialRunTabSysprep';

const InitialRunTab: FC<ConfigurationInnerTabProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const accessReview = asAccessReview(VirtualMachineModel, vm, 'update' as K8sVerb);
  const [canUpdateVM] = useAccessReview(accessReview || {});

  return (
    <SidebarEditor
      onResourceUpdate={onSubmitYAML}
      pathsToHighlight={PATHS_TO_HIGHLIGHT.SCRIPTS_TAB}
      resource={vm}
    >
      {(resource) => (
        <PageSection variant={PageSectionVariants.light}>
          <Title headingLevel="h2">
            <SearchItem id="initial-run">{t('Initial run')}</SearchItem>
          </Title>
          <DescriptionList className="pf-c-description-list">
            <InitialRunTabCloudinit
              canUpdateVM={canUpdateVM}
              onSubmit={onSubmitYAML}
              vm={resource}
              vmi={vmi}
            />
            <Divider />
            <InitialRunTabSysprep canUpdateVM={canUpdateVM} vm={resource} />
          </DescriptionList>
        </PageSection>
      )}
    </SidebarEditor>
  );
};

export default InitialRunTab;
