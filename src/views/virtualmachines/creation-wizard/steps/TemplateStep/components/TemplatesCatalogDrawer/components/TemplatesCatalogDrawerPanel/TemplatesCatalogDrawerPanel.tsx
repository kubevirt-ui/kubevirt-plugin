import React, { FCC, memo, useCallback, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getParameters } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Spinner, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { TemplatesDrawerTabKey } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/components/TemplatesCatalogDrawerPanel/utils/types';
import { useDrawerContext } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import { getTemplateParametersSplit } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import ParametersSections from '../ParametersSections';
import TemplateInfoSection from '../TemplateInfoSection';

const TemplatesCatalogDrawerPanel: FCC = memo(() => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<TemplatesDrawerTabKey>(
    TemplatesDrawerTabKey.Details,
  );
  const { template, templateDataLoaded, templateLoadingError } = useDrawerContext();

  const [requiredParameters] = getTemplateParametersSplit(getParameters(template) ?? []);

  const handleTabKey = useCallback((_: unknown, tabKey: TemplatesDrawerTabKey): void => {
    setActiveTabKey(tabKey);
  }, []);

  if (templateLoadingError) {
    return (
      <Alert isInline title={t('Error loading template')} variant={AlertVariant.danger}>
        {templateLoadingError.message}
      </Alert>
    );
  }

  if (!templateDataLoaded) {
    return <Spinner />;
  }

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
          eventKey={TemplatesDrawerTabKey.RequiredParams}
          title={<TabTitleText>{t('Required parameters')}</TabTitleText>}
        >
          <ParametersSections requiredParameters={requiredParameters} />
        </Tab>
      )}
    </Tabs>
  );
});

export default TemplatesCatalogDrawerPanel;
