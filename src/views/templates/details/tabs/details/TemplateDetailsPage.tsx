import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateDetailsLeftGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsRightGrid';
import { isCommonVMTemplate } from 'src/views/templates/utils/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';

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

const TemplateDetailsPage: React.FC<TemplateDetailsPageProps> = ({ obj: template }) => {
  const isCommonTemplate = isCommonVMTemplate(template);

  const onSubmitTemplate = React.useCallback(
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
            <SidebarEditorSwitch />
            <Grid className="margin-top">
              <GridItem span={5} className="margin-top-grid-item">
                <TemplateDetailsLeftGrid template={resource} editable={!isCommonTemplate} />
              </GridItem>
              <GridItem lg={1}></GridItem>
              <GridItem span={5} className="margin-top-grid-item">
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
