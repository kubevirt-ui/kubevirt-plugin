import * as React from 'react';

import { WizardTab } from '@catalog/wizard/tabs';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { ExpandableSection, Stack, StackItem } from '@patternfly/react-core';

import Cloudinit from './components/CloudInit';
import Sysprep from './components/sysprep/Sysprep';
import { CLOUD, SYSPREP } from './utils/consts';

import './WizardScriptsTab.scss';

const WizardScriptsTab: WizardTab = ({ vm, loaded, updateVM, tabsData }) => {
  const { t } = useKubevirtTranslation();
  const isWindows = tabsData?.overview?.templateMetadata?.osType === OS_NAME_TYPES.windows;
  const [expanded, setExpanded] = React.useState<string>(isWindows ? SYSPREP : CLOUD);

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
            isIndented
          >
            <Cloudinit vm={vm} updateVM={updateVM} loaded={loaded} />
          </ExpandableSection>
        </StackItem>
        <StackItem>
          <ExpandableSection
            className="wizard-scripts-tab-expanable-section"
            toggleText={t('Sysprep')}
            onToggle={() => onToggle(SYSPREP)}
            isExpanded={expanded === SYSPREP}
            id={SYSPREP}
            isIndented
          >
            <Sysprep />
          </ExpandableSection>
        </StackItem>
      </Stack>
    </div>
  );
};

export default WizardScriptsTab;
