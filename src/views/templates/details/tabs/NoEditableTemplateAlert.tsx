import * as React from 'react';
import { Trans } from 'react-i18next';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateProviderName } from '@kubevirt-utils/resources/template';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant } from '@patternfly/react-core';

type NoEditableTemplateAlertProps = {
  template: V1Template;
};

const NoEditableTemplateAlert: React.FC<NoEditableTemplateAlertProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const osName = getOperatingSystemName(template);
  const providerName = getTemplateProviderName(template);

  return (
    <>
      <ListPageBody>
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
      </ListPageBody>
    </>
  );
};

export default NoEditableTemplateAlert;
