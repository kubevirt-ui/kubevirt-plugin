import { type FC, useMemo, useState } from 'react';
import produce from 'immer';
import { getEvictionStrategy } from 'src/views/templates/utils/selectors';

import {
  EVICTION_STRATEGIES,
  EVICTION_STRATEGY_DEFAULT,
} from '@kubevirt-utils/components/EvictionStrategy/constants';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy as getHCOEvictionStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getTemplateVirtualMachineObject, type Template } from '@kubevirt-utils/resources/template';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

type EvictionStrategyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: Template) => Promise<Template | void>;
  template: Template;
};

const EvictionStrategyModal: FC<EvictionStrategyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const templateEvictionStrategy = getEvictionStrategy(template);
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  const initialIsChecked = useMemo(() => {
    if (templateEvictionStrategy || hyperLoadingError || !hyperLoaded) {
      return templateEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    const hcoEvictionStrategy = getHCOEvictionStrategy(hyperConverge);
    if (hcoEvictionStrategy) {
      return hcoEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    return EVICTION_STRATEGY_DEFAULT === EVICTION_STRATEGIES.LiveMigrate;
  }, [hyperConverge, hyperLoaded, hyperLoadingError, templateEvictionStrategy]);

  const [userChecked, setUserChecked] = useState<boolean | undefined>(undefined);
  const isChecked = userChecked ?? initialIsChecked;

  const isInitialStable =
    Boolean(templateEvictionStrategy) || hyperLoaded || Boolean(hyperLoadingError);
  const noChangesMade = isInitialStable && isChecked === initialIsChecked;

  const updatedTemplate = useMemo(() => {
    return produce<Template>(template, (templateDraft: Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);
      ensurePath(draftVM, 'spec.template.spec');
      draftVM.spec.template.spec.evictionStrategy = isChecked
        ? EVICTION_STRATEGIES.LiveMigrate
        : EVICTION_STRATEGIES.None;
    });
  }, [isChecked, template]);

  return (
    <TabModal
      headerText={t('Eviction strategy')}
      isDisabled={noChangesMade}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      <FormGroup fieldId="eviction-strategy" isInline>
        <Checkbox
          id="eviction-strategy"
          isChecked={isChecked}
          label={t('LiveMigrate')}
          onChange={(_event, val) => setUserChecked(val)}
        />
        <FormGroupHelperText>
          {t(
            'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
          )}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default EvictionStrategyModal;
