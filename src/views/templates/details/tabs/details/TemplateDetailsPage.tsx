import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateDetailsLeftGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsRightGrid';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

import NoEditableTemplateAlert from '../NoEditableTemplateAlert';

import './TemplateDetailsPage.scss';

export type TemplateDetailsGridProps = {
  template: V1Template;
};

type TemplateDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateDetailsPage: React.FC<TemplateDetailsPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const isCommonTemplate = isCommonVMTemplate(template);

  return (
    <>
      {isCommonTemplate && <NoEditableTemplateAlert template={template} />}
      <ListPageHeader title={t('VM Template Details')}></ListPageHeader>
      <ListPageBody>
        <Grid>
          <GridItem span={5}>
            <TemplateDetailsLeftGrid template={template} />
          </GridItem>
          <GridItem span={1}></GridItem>
          <GridItem span={5}>
            <TemplateDetailsRightGrid template={template} />
          </GridItem>
        </Grid>
      </ListPageBody>
    </>
  );
};

export default TemplateDetailsPage;
