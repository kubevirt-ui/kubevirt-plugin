import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, Stack, StackItem } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

import Cloudinit from './components/CloudInit';
import Sysprep from './components/sysprep/Sysprep';
import { CLOUD, SYSPREP } from './utils/consts';

import './WizardScriptsTab.scss';

const WizardScriptsTab: React.FC<WizardVMContextType> = ({ vm, updateVM }) => {
  const { t } = useKubevirtTranslation();
  const [expanded, setExpanded] = React.useState<string>(CLOUD);

  const onToggle = (value: string) =>
    setExpanded((expandedValue) => (expandedValue === value ? '' : value));

  return (
    <div className="co-m-pane__body">
      <Stack hasGutter>
        <StackItem>
          <ExpandableSection
            className="wizard-scripts-tab-expanable-section"
            toggleText={t('Cloud-init')}
            onToggle={() => onToggle(CLOUD)}
            isExpanded={expanded === CLOUD}
            id={CLOUD}
          >
            <Cloudinit vm={vm} updateVM={updateVM} />
          </ExpandableSection>
        </StackItem>
        <StackItem>
          <ExpandableSection
            className="wizard-scripts-tab-expanable-section"
            toggleText={t('Sysprep')}
            onToggle={() => onToggle(SYSPREP)}
            isExpanded={expanded === SYSPREP}
            id={SYSPREP}
          >
            <Sysprep />
          </ExpandableSection>
        </StackItem>
      </Stack>
    </div>
  );
};

export default WizardScriptsTab;
