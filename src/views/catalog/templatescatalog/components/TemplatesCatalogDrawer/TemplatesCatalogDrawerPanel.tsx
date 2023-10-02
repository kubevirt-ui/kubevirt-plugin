import React, { FC, memo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DRAWER_FORM_ID } from '@catalog/templatescatalog/utils/consts';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import {
  DescriptionListDescription,
  ExpandableSection,
  Form,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useDrawerContext } from './hooks/useDrawerContext';
import StorageSection from './StorageSection/StorageSection';
import FieldsSections from './FieldsSections';
import { TemplateInfoSection } from './TemplateInfoSection';

export const TemplatesCatalogDrawerPanel: FC = memo(() => {
  const { t } = useKubevirtTranslation();

  const { vm } = useDrawerContext();
  const hostDevicesCount = getHostDevices(vm)?.length || 0;
  const gpusCount = getGPUDevices(vm)?.length || 0;
  const hardwareDevicesCount = hostDevicesCount + gpusCount;

  const methods = useForm();

  return (
    <div className="modal-body modal-body-border modal-body-content">
      <div className="modal-body-inner-shadow-covers">
        <div className="co-catalog-page__overlay-body">
          <FormProvider {...methods}>
            <Form id={DRAWER_FORM_ID}>
              <Grid hasGutter>
                <GridItem span={6}>
                  <Stack className="template-catalog-drawer-info" hasGutter>
                    <StackItem>
                      <TemplateInfoSection />
                      {hardwareDevicesCount !== 0 && (
                        <ExpandableSection
                          toggleText={t('Hardware devices ({{count}})', {
                            count: hardwareDevicesCount,
                          })}
                          isIndented
                        >
                          <DescriptionListDescription>
                            <HardwareDevices hideEdit vm={vm} />
                          </DescriptionListDescription>
                        </ExpandableSection>
                      )}
                    </StackItem>
                  </Stack>
                </GridItem>

                <GridItem span={6}>
                  <StorageSection />

                  <FieldsSections />
                </GridItem>
              </Grid>
            </Form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
});
TemplatesCatalogDrawerPanel.displayName = 'TemplatesCatalogDrawerPanel';
