import React, { FC, memo } from 'react';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template/utils/constants';
import {
  getTemplateDescription,
  getTemplateInterfaces,
  getTemplateName,
  getTemplateNetworks,
  getTemplateVirtualMachineObject,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { DescriptionList } from '@patternfly/react-core';
import DisksReviewTable from '@virtualmachines/creation-wizard/components/DisksReviewTable/DisksReviewTable';
import useWizardDisksTableData from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/useWizardDisksTableData';
import NetworksReviewTable from '@virtualmachines/creation-wizard/components/NetworksReviewTable';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';

import TemplateExpandableDescription from './TemplateExpandableDescription';

const TemplateInfoSection: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { selectedTemplate } = useVMWizardStore();
  const vm = getTemplateVirtualMachineObject(selectedTemplate);

  const notAvailable = t('N/A');
  const displayName = getTemplateName(selectedTemplate);
  const description = getTemplateDescription(selectedTemplate) || notAvailable;
  const workload = getTemplateWorkload(selectedTemplate);
  const networks = getTemplateNetworks(selectedTemplate);
  const interfaces = getTemplateInterfaces(selectedTemplate);
  const [disks] = useWizardDisksTableData(vm);
  const isDefaultTemplate = isDefaultVariantTemplate(selectedTemplate);

  return (
    <DescriptionList className="pf-v6-u-mt-lg">
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
        bodyContent={<CPUDescription cpu={getCPU(vm)} />}
        data-test-id="edit-cpu-mem"
        descriptionData={<CPUMemory vm={vm} />}
        descriptionHeader={t('CPU | Memory')}
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.CPU_MEMORY}
      />
      <DescriptionItem
        descriptionData={<NetworksReviewTable interfaces={interfaces} networks={networks} />}
        descriptionHeader={t('Network interfaces ({{networks}})', { networks: networks?.length })}
      />
      <DescriptionItem
        descriptionData={<DisksReviewTable disks={disks} />}
        descriptionHeader={t('Disks ({{disks}})', { disks: disks?.length })}
      />
    </DescriptionList>
  );
});

export default TemplateInfoSection;
