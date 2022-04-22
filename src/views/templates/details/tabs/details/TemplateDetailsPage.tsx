import * as React from 'react';
import { Trans } from 'react-i18next';
import { RouteComponentProps } from 'react-router-dom';
import TemplateDetailsLeftGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsLeftGrid';
import TemplateDetailsRightGrid from 'src/views/templates/details/tabs/details/components/TemplateDetailsRightGrid';
import { isCommonVMTemplate } from 'src/views/templates/utils';
import { getTemplateProviderName } from 'src/views/templates/utils/selectors';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Grid, GridItem } from '@patternfly/react-core';

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
  const osName = getOperatingSystemName(template);
  const providerName = getTemplateProviderName(template);

  return (
    <>
      <ListPageBody>
        {isCommonTemplate && (
          <Alert
            className="alert-margin-top-bottom"
            isInline
            variant={AlertVariant.info}
            title={t('Templates provided by {{providerName}} are not editable.', {
              providerName,
            })}
          >
            <Trans ns="plugin__kubevirt-plugin">
              {{ osName }} VM can not be edited because it is provided by the Red Hat OpenShift
              Virtualization Operator.
              <br />
              We suggest you to create a custom Template from this {{ providerName }} template.
              <div className="margin-top">
                <a
                  href={`/k8s/ns/${template.metadata.namespace}/templates/${template.metadata.name}`} // TODO custom template creation
                >
                  {t('Create a new custom template')}
                </a>
              </div>
            </Trans>
          </Alert>
        )}
      </ListPageBody>
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
