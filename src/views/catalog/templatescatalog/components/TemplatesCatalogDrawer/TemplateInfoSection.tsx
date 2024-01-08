import React, { FC, memo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { updateVMCPUMemory } from '@catalog/templatescatalog/utils/helpers';
import { WizardOverviewDisksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CpuMemoryModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template/utils/constants';
import {
  getTemplateDescription,
  getTemplateDocumentationURL,
  getTemplateInterfaces,
  getTemplateName,
  getTemplateNetworks,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getCPU, getDisks } from '@kubevirt-utils/resources/vm';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import { useDrawerContext } from './hooks/useDrawerContext';
import TemplateExpandableDescription from './TemplateExpandableDescription';

export const TemplateInfoSection: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { setVM, template, vm } = useDrawerContext();
  const { ns } = useParams<{ ns: string }>();
  const vmNamespace = ns || DEFAULT_NAMESPACE;

  const notAvailable = t('N/A');
  const displayName = getTemplateName(template);
  const description = getTemplateDescription(template) || notAvailable;
  const documentationUrl = getTemplateDocumentationURL(template);
  const workload = getTemplateWorkload(template);
  const networks = getTemplateNetworks(template);
  const interfaces = getTemplateInterfaces(template);
  const disks = getDisks(vm);
  const isDefaultTemplate = isDefaultVariantTemplate(template);
  const [isTemplateInfoExpanded, setIsTemplateInfoExpanded] = useState(true);

  return (
    <ExpandableSection
      isExpanded={isTemplateInfoExpanded}
      isIndented
      onToggle={setIsTemplateInfoExpanded}
      toggleText={t('Template info')}
    >
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Operating system')}</DescriptionListTerm>
          <DescriptionListDescription>{displayName}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Workload type')}</DescriptionListTerm>
          <DescriptionListDescription>
            {WORKLOADS_LABELS[workload] ?? t('Other')} {isDefaultTemplate && t('(default)')}
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
                variant={ButtonVariant.link}
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
        <VirtualMachineDescriptionItem
          bodyContent={
            <CPUDescription
              cpu={getCPU(vm)}
              helperTextResource={CpuMemHelperTextResources.FutureVM}
            />
          }
          onEditClick={() =>
            createModal(({ isOpen, onClose }) => (
              <CPUMemoryModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={updateVMCPUMemory(vmNamespace, setVM, setVM)}
                templateNamespace={template?.metadata?.namespace}
                vm={vm}
              />
            ))
          }
          descriptionData={<CPUMemory vm={vm} />}
          descriptionHeader={t('CPU | Memory')}
          isEdit
          isPopover
        />
        <DescriptionListGroup>
          <DescriptionListTerm>
            {t('Network interfaces ({{count}})', { count: networks?.length })}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <WizardOverviewNetworksTable interfaces={interfaces} networks={networks} />
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {t('Disks ({{count}})', { count: disks?.length })}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <WizardOverviewDisksTable vm={vm} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </ExpandableSection>
  );
});
