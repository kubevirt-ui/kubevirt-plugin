import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { Badge, Split, SplitItem } from '@patternfly/react-core';

type VirtualMachineTemplatesSourceProps = {
  template: V1Template;
  availableDatasources: Record<string, V1beta1DataSource>;
};
const VirtualMachineTemplatesSource: React.FC<VirtualMachineTemplatesSourceProps> = ({
  template,
  availableDatasources,
}) => {
  const { t } = useKubevirtTranslation();
  const bootSource = getTemplateBootSourceType(template);
  const dataSource =
    availableDatasources?.[
      `${bootSource?.source?.sourceRef?.namespace}-${bootSource?.source?.sourceRef?.name}`
    ];
  const bootSourceLabel = t(getVMBootSourceLabel(bootSource?.type, dataSource));
  const isBootSourceAvailable = bootSource?.type !== BOOT_SOURCE.NONE;

  return (
    <Split hasGutter>
      <SplitItem>{bootSourceLabel}</SplitItem>
      {isBootSourceAvailable && (
        <SplitItem>
          <Badge key="available-boot">{t('Source available')}</Badge>
        </SplitItem>
      )}
    </Split>
  );
};

export default VirtualMachineTemplatesSource;
