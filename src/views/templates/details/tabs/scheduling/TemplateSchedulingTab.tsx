import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import TemplateSchedulingLeftGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import TemplateSchedulingRightGrid from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingRightGrid';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

type TemplateSchedulingTabProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateSchedulingTab: React.FC<TemplateSchedulingTabProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('Scheduling and resources requirements')}></ListPageHeader>
      <ListPageBody>
        <Grid>
          <GridItem span={5}>
            <TemplateSchedulingLeftGrid template={template} />
          </GridItem>
          <GridItem span={1}></GridItem>
          <GridItem span={5}>
            <TemplateSchedulingRightGrid template={template} />
          </GridItem>
        </Grid>
      </ListPageBody>
    </>
  );
};

export default TemplateSchedulingTab;
