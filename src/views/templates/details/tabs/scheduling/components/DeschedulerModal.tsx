import * as React from 'react';
import produce from 'immer';
import { isDeschedulerOn } from 'src/views/templates/utils/utils';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Checkbox, Form, FormGroup } from '@patternfly/react-core';

const ensurePath = <T extends object>(data: T, paths: string | string[]) => {
  let current = data;

  if (Array.isArray(paths)) {
    paths.forEach((path) => ensurePath(data, path));
  } else {
    const keys = paths.split('.');

    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }
};

type DeschedulerModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
};

const DeschedulerModal: React.FC<DeschedulerModalProps> = ({ template, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [isOn, setOn] = React.useState<boolean>(isDeschedulerOn(template)); // the default is OFF, the admin has to opt-in this feature

  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
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
      obj={updatedTemplate}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Descheduler settings')}
    >
      <Form>
        <FormGroup fieldId="descheduler">
          <Checkbox
            id="descheduler"
            isChecked={isOn}
            onChange={setOn}
            label={t('Enable Descheduler')}
            description={t('Allow the Descheduler to evict the VirtualMachine via live migration')}
          />
        </FormGroup>
        {isOn && (
          <Alert isInline variant={AlertVariant.info} title={t('Active Descheduler')}>
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
