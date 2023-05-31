import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import TemplateSchedulingLeftGrid from './components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from './components/TemplateSchedulingRightGrid';

import './TemplateSchedulingTab.scss';

type TemplateSchedulingTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateSchedulingTab: FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const { t } = useKubevirtTranslation();

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  return (
    <PageSection>
      <SidebarEditor<V1Template> resource={template} onResourceUpdate={onSubmitTemplate}>
        {(resource) => (
          <>
            <Flex className="template-scheduling-tab__flex">
              <Title headingLevel="h2">{t('Scheduling and resource requirements')}</Title>
              <SidebarEditorSwitch />
            </Flex>
            <Grid className="margin-top">
              <GridItem span={5}>
                <TemplateSchedulingLeftGrid template={resource} editable={isTemplateEditable} />
              </GridItem>
              <GridItem lg={1}></GridItem>
              <GridItem span={5}>
                <TemplateSchedulingRightGrid template={resource} editable={isTemplateEditable} />
              </GridItem>
            </Grid>
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateSchedulingTab;
