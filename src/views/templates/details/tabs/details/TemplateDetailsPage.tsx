import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateDetailsLeftGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsRightGrid';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

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

  return (
    <p className="list-page-body-no-border-top">
      <ListPageBody>
        <Grid>
          <GridItem span={5} className="margin-top-grid-item">
            <TemplateDetailsLeftGrid template={template} editable={!isCommonTemplate} />
          </GridItem>
          <GridItem span={1}></GridItem>
          <GridItem span={5} className="margin-top-grid-item">
            <TemplateDetailsRightGrid template={template} />
          </GridItem>
        </Grid>
      </ListPageBody>
    </p>
  );
};

export default TemplateDetailsPage;
