import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateSchedulingLeftGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingRightGrid';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

import { isCommonVMTemplate } from '../../../utils';

import './TemplateSchedulingTab.scss';

type TemplateSchedulingTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateSchedulingTab: React.FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const isEditDisabled = isCommonVMTemplate(template);

  return (
    <p className="list-page-body-no-border-top">
      <ListPageBody>
        <Grid>
          <GridItem span={5} className="margin-top-grid-item">
            <TemplateSchedulingLeftGrid template={template} editable={!isEditDisabled} />
          </GridItem>
          <GridItem span={1}></GridItem>
          <GridItem span={5} className="margin-top-grid-item">
            <TemplateSchedulingRightGrid template={template} editable={!isEditDisabled} />
          </GridItem>
        </Grid>
      </ListPageBody>
    </p>
  );
};

export default TemplateSchedulingTab;
