import React, { FC } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import SidebarEditor from '@kubevirt-utils/components/SidebarEditor/SidebarEditor';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateTemplate } from '@kubevirt-utils/resources/template';
import { Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

import TemplateDetailsLeftGrid from './components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from './components/TemplateDetailsRightGrid';

import './TemplateDetailsPage.scss';

export type TemplateDetailsGridProps = {
  editable?: boolean;
  template: V1Template;
};

export type LabelsAnnotationsType = { [key: string]: string };

type TemplateDetailsPageProps = {
  obj?: V1Template;
};

const TemplateDetailsPage: FC<TemplateDetailsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();

  return (
    <PageSection>
      <SidebarEditor<V1Template> onResourceUpdate={updateTemplate} resource={template}>
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
