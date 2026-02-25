import React, { FC, memo, useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { TemplatesDrawerTabKey } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/components/TemplatesCatalogDrawerPanel/utils/types';
import { getTemplateParametersSplit } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import ParametersSections from '../ParametersSections';
import TemplateInfoSection from '../TemplateInfoSection';

const TemplatesCatalogDrawerPanel: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<TemplatesDrawerTabKey>(
    TemplatesDrawerTabKey.Details,
  );
  const { selectedTemplate } = useVMWizardStore();

  const [requiredParameters] = getTemplateParametersSplit(selectedTemplate?.parameters ?? []);

  const handleTabKey = useCallback((_: unknown, tabKey: TemplatesDrawerTabKey): void => {
    setActiveTabKey(tabKey);
  }, []);

  return (
    <Tabs activeKey={activeTabKey} onSelect={handleTabKey}>
      <Tab
        eventKey={TemplatesDrawerTabKey.Details}
        title={<TabTitleText>{t('Details')}</TabTitleText>}
      >
        <TemplateInfoSection />
      </Tab>
      {!isEmpty(requiredParameters) && (
        <Tab
          eventKey={TemplatesDrawerTabKey.OptionalParams}
          title={<TabTitleText>{t('Optional parameters')}</TabTitleText>}
        >
          <ParametersSections requiredParameters={requiredParameters} />
        </Tab>
      )}
    </Tabs>
  );
});

export default TemplatesCatalogDrawerPanel;
