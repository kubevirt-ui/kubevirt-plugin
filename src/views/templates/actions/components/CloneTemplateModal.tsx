import * as React from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TEMPLATE_TYPE_VM } from '@kubevirt-utils/resources/template';
import { k8sCreate, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ButtonVariant, Form, FormGroup, TextInput } from '@patternfly/react-core';

type CloneTemplateModalProps = {
  isOpen: boolean;
  obj: V1Template;
  onClose: () => void;
};

const CloneTemplateModal: React.FC<CloneTemplateModalProps> = ({ isOpen, obj, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [templateName, setTemplateName] = React.useState('');
  const [templateProvider, setTemplateProvider] = React.useState('');

  const onSubmit = async () => {
    await k8sCreate<V1Template>({
      model: TemplateModel,
      data: {
        ...obj,
        metadata: {
          annotations: {
            ...obj?.metadata?.annotations,
            'template.kubevirt.io/provider': templateProvider,
          },
          labels: { ...obj?.metadata?.labels, 'template.kubevirt.io/type': TEMPLATE_TYPE_VM },
          name: templateName,
          namespace: obj?.metadata?.namespace,
        },
      },
    });
  };

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Clone Template')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
        submitBtnText={t('Save')}
        submitBtnVariant={ButtonVariant.primary}
      >
        <Form>
          <FormGroup label={t('Template name')} fieldId="name" isRequired>
            <TextInput id="name" type="text" value={templateName} onChange={setTemplateName} />
          </FormGroup>
          <FormGroup
            label={t('Template provider')}
            fieldId="provider"
            isRequired
            helperText={t('Example: your company name')}
          >
            <TextInput
              id="provider"
              type="text"
              value={templateProvider}
              onChange={setTemplateProvider}
            />
          </FormGroup>
        </Form>
      </TabModal>
    </>
  );
};

export default CloneTemplateModal;
