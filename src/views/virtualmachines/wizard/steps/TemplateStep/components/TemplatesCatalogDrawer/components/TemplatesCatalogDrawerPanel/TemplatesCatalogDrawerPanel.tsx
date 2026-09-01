/* eslint-disable */
import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceKey } from '@kubevirt-utils/resources/shared';
import { getParameters } from '@kubevirt-utils/resources/template';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Spinner, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_UI_STATE } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import { TemplatesDrawerTabKey } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/components/TemplatesCatalogDrawerPanel/utils/types';
import { useDrawerContext } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import {
  allRequiredParametersAreFulfilled,
  getTemplateParametersSplit,
} from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils';

import ParametersSections from '../ParametersSections';
import TemplateInfoSection from '../TemplateInfoSection';

const TemplatesCatalogDrawerPanel: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { control } = useVMWizard();
  const templateProcessError = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_UI_STATE.TEMPLATE_PROCESS_ERROR,
  });
  const [activeTabKey, setActiveTabKey] = useState<TemplatesDrawerTabKey>(
    TemplatesDrawerTabKey.Details,
  );
  const { template, templateDataLoaded, templateLoadingError } = useDrawerContext();
  const templateKey = getResourceKey(template);

  const [requiredParameters] = getTemplateParametersSplit(getParameters(template) ?? []);
  const hasRequiredParameters = !isEmpty(requiredParameters);

  useEffect(() => {
    setActiveTabKey(TemplatesDrawerTabKey.Details);
  }, [templateKey]);

  useEffect(() => {
    if (templateProcessError && hasRequiredParameters) {
      setActiveTabKey(TemplatesDrawerTabKey.RequiredParams);
    }
  }, [templateProcessError, hasRequiredParameters]);

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
    <>
      {templateProcessError && (
        <Alert
          className="pf-v6-u-mt-md"
          isInline
          title={
            allRequiredParametersAreFulfilled(template)
              ? t('Unable to continue')
              : t('Missing field')
          }
          variant={AlertVariant.danger}
        >
          {templateProcessError}
        </Alert>
      )}
      <Tabs activeKey={activeTabKey} onSelect={handleTabKey}>
        <Tab
          eventKey={TemplatesDrawerTabKey.Details}
          title={<TabTitleText>{t('Details')}</TabTitleText>}
        >
          <TemplateInfoSection />
        </Tab>
        {hasRequiredParameters && (
          <Tab
            eventKey={TemplatesDrawerTabKey.RequiredParams}
            title={<TabTitleText>{t('Required parameters')}</TabTitleText>}
          >
            <ParametersSections
              requiredParameters={requiredParameters}
              showValidation={Boolean(templateProcessError)}
            />
          </Tab>
        )}
      </Tabs>
    </>
  );
});

export default TemplatesCatalogDrawerPanel;
