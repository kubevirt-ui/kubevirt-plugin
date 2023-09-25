import React, { FC, memo, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import produce from 'immer';

import { CustomizeForm } from '@catalog/customize/components/CustomizeForms/CustomizeForm';
import CustomizeFormWithStorage from '@catalog/customize/components/CustomizeForms/CustomizeFormWithStorage';
import { hasCustomizableSource } from '@catalog/customize/utils';
import { updateVMCPUMemory } from '@catalog/templatescatalog/utils/helpers';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template/utils/selectors';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import TemplatesCatalogDrawerLeftColumn from './TemplatesCatalogDrawerLeftColumn';
import TemplatesCatalogDrawerRightColumn from './TemplatesCatalogDrawerRightColumn';

type TemplatesCatalogDrawerPanelProps = {
  template: V1Template;
};

export const TemplatesCatalogDrawerPanel: FC<TemplatesCatalogDrawerPanelProps> = memo(
  ({ template }) => {
    const { t } = useKubevirtTranslation();
    const { updateVM } = useWizardVMContext();
    const { ns } = useParams<{ ns: string }>();
    const { params } = useURLParams();

    const isBootSourceAvailable = params.get('defaultSourceExists') === 'true';
    const vmNamespace = ns || DEFAULT_NAMESPACE;

    const [updatedVM, setUpdatedVM] = useState<V1VirtualMachine>(undefined);
    const [error, setError] = useState(undefined);

    const [templateWithGeneratedValues, setTemplateWithGeneratedValues] = useState(template);

    const Form = useMemo(() => {
      const withDiskSource = hasCustomizableSource(template);

      if (withDiskSource) {
        return CustomizeFormWithStorage;
      } else {
        return CustomizeForm;
      }
    }, [template]);

    useEffect(() => {
      setError(undefined);

      const updatedTemplate = produce<V1Template>(template, (draftTemplate) => {
        draftTemplate.metadata.namespace = vmNamespace;
      });

      k8sCreate<V1Template>({
        data: updatedTemplate,
        model: ProcessedTemplatesModel,
        queryParams: {
          dryRun: 'All',
        },
      })
        .then((processedTemplate) => {
          setTemplateWithGeneratedValues(processedTemplate);
          updateVMCPUMemory(
            vmNamespace,
            updateVM,
            setUpdatedVM,
          )(getTemplateVirtualMachineObject(processedTemplate)).catch((err) => {
            setError(err);
          });
        })
        .catch((err) => {
          setError(err);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vmNamespace, template]);

    return (
      <div className="modal-body modal-body-border modal-body-content">
        <div className="modal-body-inner-shadow-covers">
          <div className="co-catalog-page__overlay-body">
            <Stack className="template-catalog-drawer-info" hasGutter>
              <StackItem>
                <Title headingLevel="h1" size="lg">
                  {t('Template info')}
                </Title>
              </StackItem>
              <StackItem>
                <Grid hasGutter>
                  <GridItem span={6}>
                    <TemplatesCatalogDrawerLeftColumn template={template} />
                  </GridItem>
                  <GridItem span={6}>
                    <TemplatesCatalogDrawerRightColumn
                      setUpdatedVM={setUpdatedVM}
                      template={template}
                      updatedVM={updatedVM}
                    />
                  </GridItem>
                </Grid>
              </StackItem>

              <StackItem>
                <Form
                  isBootSourceAvailable={isBootSourceAvailable}
                  template={templateWithGeneratedValues}
                />
              </StackItem>

              {error && (
                <StackItem>
                  <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
                    {error?.message}
                  </Alert>
                </StackItem>
              )}
            </Stack>
          </div>
        </div>
      </div>
    );
  },
);
TemplatesCatalogDrawerPanel.displayName = 'TemplatesCatalogDrawerPanel';
