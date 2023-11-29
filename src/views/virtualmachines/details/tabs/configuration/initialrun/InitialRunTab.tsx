import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { asAccessReview } from '@kubevirt-utils/resources/shared';
import { PATHS_TO_HIGHLIGHT } from '@kubevirt-utils/resources/vm/utils/constants';
import { K8sVerb, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Divider, PageSection, Title } from '@patternfly/react-core';

import { onSubmitYAML } from '../details/utils/utils';

import InitRunTabCloudinit from './components/InitRunTabCloudInit';
import InitRunTabSysprep from './components/InitRunTabSysprep';

type InitialRunTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const InitialRunTab: FC<InitialRunTabProps> = ({ obj: vm, vmi }) => {
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
        <PageSection>
          <Title headingLevel="h2">{t('Initial run')}</Title>
          <DescriptionList>
            <InitRunTabCloudinit
              canUpdateVM={canUpdateVM}
              onSubmit={onSubmitYAML}
              resource={resource}
              vmi={vmi}
            />
            <Divider />
            <InitRunTabSysprep canUpdateVM={canUpdateVM} vm={resource} />
          </DescriptionList>
        </PageSection>
      )}
    </SidebarEditor>
  );
};

export default InitialRunTab;
