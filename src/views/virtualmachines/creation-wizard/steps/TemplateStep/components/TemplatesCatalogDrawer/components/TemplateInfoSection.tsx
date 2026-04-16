import React, { FC, memo } from 'react';

import CPUDescription from '@kubevirt-utils/components/CPUDescription/CPUDescription';
import CPUMemory from '@kubevirt-utils/components/CPUMemory/CPUMemory';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { WORKLOADS_LABELS } from '@kubevirt-utils/resources/template/utils/constants';
import {
  getTemplateDescription,
  getTemplateInterfaces,
  getTemplateNetworks,
  getTemplateWorkload,
  isDefaultVariantTemplate,
} from '@kubevirt-utils/resources/template/utils/selectors';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { networksHavePodNetwork } from '@kubevirt-utils/resources/vm/utils/network/utils';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Alert, DescriptionList } from '@patternfly/react-core';
import DisksReviewTable from '@virtualmachines/creation-wizard/components/DisksReviewTable/DisksReviewTable';
import useWizardDisksTableData from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/useWizardDisksTableData';
import NetworksReviewTable from '@virtualmachines/creation-wizard/components/NetworksReviewTable';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import { useDrawerContext } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/hooks/useDrawerContext';

import TemplateExpandableDescription from './TemplateExpandableDescription';

const TemplateInfoSection: FC = memo(() => {
  const { t } = useKubevirtTranslation();
  const { cluster } = useVMWizardStore();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const { template, vm } = useDrawerContext();
  const [disks] = useWizardDisksTableData(vm);

  const notAvailable = t('N/A');
  const description = getTemplateDescription(template) || notAvailable;
  const workload = getTemplateWorkload(template);
  const networks = getTemplateNetworks(template);
  const interfaces = getTemplateInterfaces(template);
  const isDefaultTemplate = isDefaultVariantTemplate(template);

  const hasPodNetwork = networksHavePodNetwork(networks);

  const operatingSystem = getOperatingSystemName(template) || notAvailable;

  return (
    <DescriptionList className="pf-v6-u-mt-lg">
      <DescriptionItem
        descriptionData={operatingSystem}
        descriptionHeader={t('Operating system')}
      />
      <DescriptionItem
        descriptionData={`${WORKLOADS_LABELS[workload] ?? t('Other')} ${
          isDefaultTemplate ? t('(default)') : ''
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
      {isIPv6SingleStack && hasPodNetwork && (
        <Alert
          isInline
          title={t("Can't use Pod networking in IPv6 single-stack cluster")}
          variant="warning"
        >
          {networks.length === 1 &&
            t('You can add a different network interface in the Customization step')}
        </Alert>
      )}
      <DescriptionItem
        descriptionData={<DisksReviewTable disks={disks} />}
        descriptionHeader={t('Disks ({{disks}})', { disks: disks?.length })}
      />
    </DescriptionList>
  );
});

export default TemplateInfoSection;
