import * as React from 'react';
import produce from 'immer';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

type EvictionStrategyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const EvictionStrategyModal: React.FC<EvictionStrategyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = React.useState<boolean>(!!getEvictionStrategy(template));

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);
      checked
        ? (draftVM.spec.template.spec.evictionStrategy = 'LiveMigrate')
        : delete draftVM.spec.template.spec.evictionStrategy;
    });
  }, [checked, template]);

  return (
    <TabModal
      headerText={t('Eviction strategy')}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup
          helperText={t(
            'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
          )}
          fieldId="eviction-strategy"
          isInline
        >
          <Checkbox
            id="eviction-strategy"
            isChecked={checked}
            label={'LiveMigrate'}
            onChange={setChecked}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EvictionStrategyModal;
