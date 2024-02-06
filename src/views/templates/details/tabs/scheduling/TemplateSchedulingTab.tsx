import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../hooks/useIsTemplateEditable';

import TemplateSchedulingLeftGrid from './components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from './components/TemplateSchedulingRightGrid';

import './TemplateSchedulingTab.scss';

type TemplateSchedulingTabProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1Template;
};

const TemplateSchedulingTab: FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const { t } = useKubevirtTranslation();

  const onSubmitTemplate = useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  return (
    <PageSection variant={PageSectionVariants.light}>
      <SidebarEditor<V1Template> onResourceUpdate={onSubmitTemplate} resource={template}>
        {(resource) => (
          <>
            <Title headingLevel="h2">{t('Scheduling and resource requirements')}</Title>
            <Grid className="margin-top">
              <GridItem span={5}>
                <TemplateSchedulingLeftGrid editable={isTemplateEditable} template={resource} />
              </GridItem>
              <GridItem lg={1}></GridItem>
              <GridItem span={5}>
                <TemplateSchedulingRightGrid editable={isTemplateEditable} template={resource} />
              </GridItem>
            </Grid>
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateSchedulingTab;
