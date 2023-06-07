import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

import TemplateDetailsLeftGrid from './components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from './components/TemplateDetailsRightGrid';

import './TemplateDetailsPage.scss';

export type TemplateDetailsGridProps = {
  template: V1Template;
  editable?: boolean;
};

export type LabelsAnnotationsType = { [key: string]: string };

type TemplateDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateDetailsPage: FC<TemplateDetailsPageProps> = ({ obj: template }) => {
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
            <Title headingLevel="h2">{t('Template details')}</Title>
            <Grid className="margin-top">
              <GridItem span={5}>
                <TemplateDetailsLeftGrid template={resource} />
              </GridItem>
              <GridItem lg={1}></GridItem>
              <GridItem span={5}>
                <TemplateDetailsRightGrid template={resource} />
              </GridItem>
            </Grid>
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateDetailsPage;
