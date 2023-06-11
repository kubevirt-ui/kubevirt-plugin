import * as React from 'react';
import produce from 'immer';
import { isDeschedulerOn } from 'src/views/templates/utils/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Checkbox, Form, FormGroup } from '@patternfly/react-core';

type DeschedulerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  template: V1Template;
};

const DeschedulerModal: React.FC<DeschedulerModalProps> = ({ isOpen, onClose, template }) => {
  const { t } = useKubevirtTranslation();
  const [isOn, setOn] = React.useState<boolean>(isDeschedulerOn(template)); // the default is OFF, the admin has to opt-in this feature

  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        data: updatedTemplate,
        model: TemplateModel,
        name: updatedTemplate?.metadata?.name,
        ns: updatedTemplate?.metadata?.namespace,
      }),
    [],
  );

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (draft: V1Template) => {
      const draftVM = getTemplateVirtualMachineObject(draft);
      ensurePath(draftVM, 'spec.template.metadata.annotations');
      if (!draftVM.spec.template.metadata.annotations)
        draftVM.spec.template.metadata.annotations = {};
      if (isOn) {
        draftVM.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL] = 'true';
      } else {
        delete draftVM.spec.template.metadata.annotations[DESCHEDULER_EVICT_LABEL];
      }
    });
  }, [template, isOn]);

  return (
    <TabModal
      headerText={t('Descheduler settings')}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup fieldId="descheduler">
          <Checkbox
            description={t('Allow the Descheduler to evict the VirtualMachine via live migration')}
            id="descheduler"
            isChecked={isOn}
            label={t('Enable Descheduler')}
            onChange={setOn}
          />
        </FormGroup>
        {isOn && (
          <Alert isInline title={t('Active Descheduler')} variant={AlertVariant.info}>
            {/* TODO fix the message */}
            {t(
              'This VirtualMachine is subject to the Descheduler profiles configured for eviction.',
            )}
          </Alert>
        )}
      </Form>
    </TabModal>
  );
};

export default DeschedulerModal;
