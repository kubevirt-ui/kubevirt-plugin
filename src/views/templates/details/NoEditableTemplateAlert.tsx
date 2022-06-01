import * as React from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateProviderName } from '@kubevirt-utils/resources/template';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import './no-editable-template-alert.scss';

type NoEditableTemplateAlertProps = {
  template: V1Template;
};

const NoEditableTemplateAlert: React.FC<NoEditableTemplateAlertProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const osName = getOperatingSystemName(template);
  const providerName = getTemplateProviderName(template);
  const { createModal } = useModal();
  const history = useHistory();

  const goToTemplatePage = React.useCallback(
    (clonedTemplate: V1Template) => {
      history.push(
        `/k8s/ns/${clonedTemplate.metadata.namespace}/templates/${clonedTemplate.metadata.name}`,
      );
    },
    [history],
  );

  return (
    <Alert
      className="alert-margin-top-bottom no-editable-template-alert"
      isInline
      variant={AlertVariant.info}
      title={t('Templates provided by {{providerName}} are not editable.', {
        providerName,
      })}
    >
      <Trans ns="plugin__kubevirt-plugin">
        {{ osName }} VirtualMachine can not be edited because it is provided by {{ providerName }}
        Virtualization Operator.
        <br />
        We suggest you to create a custom Template from this {{ providerName }} template.
        <div className="margin-top">
          <Button
            onClick={() =>
              createModal(({ isOpen, onClose }) => (
                <CloneTemplateModal
                  obj={template}
                  isOpen={isOpen}
                  onClose={onClose}
                  onTemplateCloned={goToTemplatePage}
                />
              ))
            }
            variant={ButtonVariant.link}
          >
            {t('Create a new custom Template')}
          </Button>
        </div>
      </Trans>
    </Alert>
  );
};

export default NoEditableTemplateAlert;
