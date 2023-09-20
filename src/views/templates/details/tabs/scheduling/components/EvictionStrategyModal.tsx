import React, { FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import {
  EVICTION_STRATEGIES,
  EVICTION_STRATEGY_DEFAULT,
} from '@kubevirt-utils/components/EvictionStrategy/constants';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
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

const EvictionStrategyModal: FC<EvictionStrategyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const templateEvictionStrategy = getEvictionStrategy(template);

  const [isChecked, setIsChecked] = useState<boolean>(
    templateEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate,
  );

  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  useEffect(() => {
    if (templateEvictionStrategy || hyperLoadingError || !hyperLoaded) return;

    if (hyperConverge?.spec?.evictionStrategy) {
      setIsChecked(hyperConverge?.spec?.evictionStrategy === EVICTION_STRATEGIES.LiveMigrate);
      return;
    }

    setIsChecked(EVICTION_STRATEGY_DEFAULT === EVICTION_STRATEGIES.LiveMigrate);
  }, [hyperConverge, hyperLoaded, hyperLoadingError, templateEvictionStrategy]);

  const updatedTemplate = useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);
      isChecked
        ? (draftVM.spec.template.spec.evictionStrategy = EVICTION_STRATEGIES.LiveMigrate)
        : (draftVM.spec.template.spec.evictionStrategy = EVICTION_STRATEGIES.None);
    });
  }, [isChecked, template]);

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
            isChecked={isChecked}
            label={t('LiveMigrate')}
            onChange={setIsChecked}
          />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EvictionStrategyModal;
