import React, { FC, memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import produce from 'immer';

import { updateVMCPUMemory } from '@catalog/templatescatalog/utils/helpers';
import { useWizardVMContext } from '@catalog/utils/WizardVMContext';
import { WizardOverviewDisksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';
import { ProcessedTemplatesModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template/utils/constants';
import {
  getTemplateDescription,
  getTemplateDisks,
  getTemplateDocumentationURL,
  getTemplateInterfaces,
  getTemplateName,
  getTemplateNetworks,
  getTemplateVirtualMachineObject,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import TemplateExpandableDescription from './TemplateExpandableDescription';

type TemplatesCatalogDrawerPanelProps = {
  template: V1Template;
};

export const TemplatesCatalogDrawerPanel: FC<TemplatesCatalogDrawerPanelProps> = memo(
  ({ template }) => {
    const { t } = useKubevirtTranslation();
    const { createModal } = useModal();
    const { updateVM } = useWizardVMContext();
    const { ns } = useParams<{ ns: string }>();
    const vmNamespace = ns || DEFAULT_NAMESPACE;

    const notAvailable = t('N/A');
    const vmObject = getTemplateVirtualMachineObject(template);
    const displayName = getTemplateName(template);
    const description = getTemplateDescription(template) || notAvailable;
    const documentationUrl = getTemplateDocumentationURL(template);
    const workload = getTemplateWorkload(template);
    const networks = getTemplateNetworks(template);
    const interfaces = getTemplateInterfaces(template);
    const disks = getTemplateDisks(template);
    const isDefaultTemplate = isDefaultVariantTemplate(template);
    const hostDevicesCount = getHostDevices(vmObject)?.length || 0;
    const gpusCount = getGPUDevices(vmObject)?.length || 0;
    const hardwareDevicesCount = hostDevicesCount + gpusCount;

    const [updatedVM, setUpdatedVM] = useState<V1VirtualMachine>(undefined);
    const [error, setError] = useState(undefined);

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
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
                        <DescriptionListDescription>{displayName}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Workload type')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {WORKLOADS_LABELS[workload] ?? t('Other')}{' '}
                          {isDefaultTemplate && t('(default)')}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {<TemplateExpandableDescription description={description} />}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Documentation')}</DescriptionListTerm>
                        <DescriptionListDescription>
                          {documentationUrl ? (
                            <Button
                              icon={<ExternalLinkSquareAltIcon />}
                              iconPosition="right"
                              isInline
                              isSmall
                              variant="link"
                            >
                              <a href={documentationUrl} rel="noopener noreferrer" target="_blank">
                                {t('Refer to documentation')}
                              </a>
                            </Button>
                          ) : (
                            notAvailable
                          )}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <AdditionalResources template={template} />
                    </DescriptionList>
                  </GridItem>
                  <GridItem span={6}>
                    <DescriptionList>
                      <VirtualMachineDescriptionItem
                        bodyContent={
                          <CPUDescription
                            cpu={updatedVM?.spec?.template?.spec?.domain?.cpu}
                            helperTextResource={CpuMemHelperTextResources.FutureVM}
                          />
                        }
                        onEditClick={() =>
                          createModal(({ isOpen, onClose }) => (
                            <CPUMemoryModal
                              isOpen={isOpen}
                              onClose={onClose}
                              onSubmit={updateVMCPUMemory(vmNamespace, updateVM, setUpdatedVM)}
                              templateNamespace={template?.metadata?.namespace}
                              vm={updatedVM}
                            />
                          ))
                        }
                        descriptionData={<CPUMemory vm={updatedVM} />}
                        descriptionHeader={t('CPU | Memory')}
                        isEdit
                        isPopover
                      />
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Network interfaces')}
                          {` (${networks.length})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <WizardOverviewNetworksTable
                            interfaces={interfaces}
                            networks={networks}
                          />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Disks')}
                          {` (${disks.length})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <WizardOverviewDisksTable vm={vmObject} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>
                          {t('Hardware devices')}
                          {` (${hardwareDevicesCount})`}
                        </DescriptionListTerm>
                        <DescriptionListDescription>
                          <HardwareDevices hideEdit vm={vmObject} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </GridItem>
                </Grid>
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
