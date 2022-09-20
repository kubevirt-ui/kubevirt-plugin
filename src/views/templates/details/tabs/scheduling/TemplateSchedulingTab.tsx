import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateSchedulingLeftGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingRightGrid';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import SidebarEditorSwitch from '@kubevirt-utils/components/SidebarEditor/SidebarEditorSwitch';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';

import { isCommonVMTemplate } from '../../../utils/utils';

import './TemplateSchedulingTab.scss';

type TemplateSchedulingTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateSchedulingTab: React.FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const isEditDisabled = isCommonVMTemplate(template);

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
                <TemplateSchedulingLeftGrid template={resource} editable={!isEditDisabled} />
              </GridItem>
              <GridItem lg={1}></GridItem>
              <GridItem span={5} className="margin-top-grid-item">
                <TemplateSchedulingRightGrid template={resource} editable={!isEditDisabled} />
              </GridItem>
            </Grid>
          </>
        )}
      </SidebarEditor>
    </PageSection>
  );
};

export default TemplateSchedulingTab;
