import React, { FC, memo, useState } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { updateVMCPUMemory } from '@catalog/templatescatalog/utils/helpers';
import { WizardOverviewDisksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewDisksTable/WizardOverviewDisksTable';
import { WizardOverviewNetworksTable } from '@catalog/wizard/tabs/overview/components/WizardOverviewNetworksTable/WizardOverviewNetworksTable';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import { CpuMemHelperTextResources } from '@kubevirt-utils/components/CPUDescription/utils/utils';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import CPUMemoryModal from '@kubevirt-utils/components/CPUMemoryModal/CPUMemoryModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
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
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Button, ButtonVariant, DescriptionList, ExpandableSection } from '@patternfly/react-core';
import { ExternalLinkSquareAltIcon } from '@patternfly/react-icons';

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
      onToggle={(_event, val) => setIsTemplateInfoExpanded(val)}
      toggleText={t('Template info')}
    >
      <DescriptionList>
        <DescriptionItem descriptionData={displayName} descriptionHeader={t('Operating system')} />
        <DescriptionItem
          descriptionData={`${WORKLOADS_LABELS[workload] ?? t('Other')} ${
            isDefaultTemplate && t('(default)')
          }`}
          descriptionHeader={t('Workload type')}
        />
        <DescriptionItem
          descriptionData={<TemplateExpandableDescription description={description} />}
          descriptionHeader={t('Description')}
        />
        <DescriptionItem
          descriptionData={
            documentationUrl ? (
              <Button
                icon={<ExternalLinkSquareAltIcon />}
                iconPosition="right"
                isInline
                size="sm"
                variant={ButtonVariant.link}
              >
                <a href={documentationUrl} rel="noopener noreferrer" target="_blank">
                  {t('Refer to documentation')}
                </a>
              </Button>
            ) : (
              notAvailable
            )
          }
          descriptionHeader={t('Documentation')}
        />
        <AdditionalResources template={template} />
        <DescriptionItem
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
          data-test-id="edit-cpu-mem"
          descriptionData={<CPUMemory vm={vm} />}
          descriptionHeader={t('CPU | Memory')}
          isEdit
          isPopover
          olsObj={vm}
          promptType={OLSPromptType.CPU_MEMORY}
        />
        <DescriptionItem
          descriptionData={
            <WizardOverviewNetworksTable interfaces={interfaces} networks={networks} />
          }
          descriptionHeader={t('Network interfaces ({{networks}})', { networks: networks?.length })}
        />
        <DescriptionItem
          descriptionData={<WizardOverviewDisksTable vm={vm} />}
          descriptionHeader={t('Disks ({{disks}})', { disks: disks?.length })}
        />
      </DescriptionList>
    </ExpandableSection>
  );
});
