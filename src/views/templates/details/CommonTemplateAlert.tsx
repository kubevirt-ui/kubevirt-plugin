import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import CloneTemplateModal from '@kubevirt-utils/components/CloneTemplateModal/CloneTemplateModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateProviderName } from '@kubevirt-utils/resources/template';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

type CommonTemplateAlertProps = {
  template: V1Template;
};

const CommonTemplateAlert: FC<CommonTemplateAlertProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const osName = getOperatingSystemName(template);
  const providerName = getTemplateProviderName(template);
  const { createModal } = useModal();
  const navigate = useNavigate();

  const goToTemplatePage = React.useCallback(
    (clonedTemplate: V1Template) => {
      navigate(
        `/k8s/ns/${clonedTemplate.metadata.namespace}/templates/${clonedTemplate.metadata.name}`,
      );
    },
    [navigate],
  );

  return (
    <Alert
      title={t('Templates provided by {{providerName}} are not editable.', {
        providerName,
      })}
      data-test="common-template-alert"
      isInline
      variant={AlertVariant.info}
    >
      {t(
        '{{ osName }} VirtualMachine can not be edited because it is provided by OpenShift Virtualization Operator.',
        { osName },
      )}
      <br />

      {t('We suggest you to create a custom Template from this {{ providerName }} Template.', {
        providerName,
      })}
      <div className="margin-top">
        <Button
          onClick={() =>
            createModal(({ isOpen, onClose }) => (
              <CloneTemplateModal
                isOpen={isOpen}
                obj={template}
                onClose={onClose}
                onTemplateCloned={goToTemplatePage}
              />
            ))
          }
          isInline
          variant={ButtonVariant.link}
        >
          {t('Create a new custom Template')}
        </Button>
      </div>
    </Alert>
  );
};

export default CommonTemplateAlert;
