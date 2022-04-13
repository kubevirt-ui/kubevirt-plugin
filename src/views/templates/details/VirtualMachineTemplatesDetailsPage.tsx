import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Grid, GridItem } from '@patternfly/react-core';

type VirtualMachineTemplatesDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const VirtualMachineTemplatesDetailsPage: React.FC<VirtualMachineTemplatesDetailsPageProps> = ({
  obj: template,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('')}>
        <ResourceLink
          kind={TemplateModel.kind}
          name={template.metadata.name}
          namespace={template.metadata.namespace}
        />
      </ListPageHeader>
      <Grid hasGutter>
        <GridItem span={1}>{/* Spacer */}</GridItem>
      </Grid>
      <ListPageBody></ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesDetailsPage;
