import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { Template, TemplateOrRequest } from '@kubevirt-utils/resources/template';
import { isVirtualMachineTemplateRequest } from '@kubevirt-utils/resources/template';
import useTemplatePageInstanceTypes from '@kubevirt-utils/resources/template/hooks/useTemplatePageInstanceTypes';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVirtualMachineTemplatesCPUMemoryText } from '@templates/utils/utils';

type TemplateCPUMemoryCellContentProps = {
  cluster?: string;
  namespace?: string;
  template: Template;
};

const TemplateCPUMemoryCellContent: FC<TemplateCPUMemoryCellContentProps> = ({
  cluster,
  namespace,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const instanceTypes = useTemplatePageInstanceTypes(namespace, cluster ?? getCluster(template));

  return <>{getVirtualMachineTemplatesCPUMemoryText(template, t, { instanceTypes })}</>;
};

type TemplateCPUMemoryCellProps = {
  cluster?: string;
  namespace?: string;
  row: TemplateOrRequest;
};

const TemplateCPUMemoryCell: FC<TemplateCPUMemoryCellProps> = ({ cluster, namespace, row }) => {
  if (isVirtualMachineTemplateRequest(row)) {
    return <>{NO_DATA_DASH}</>;
  }

  return <TemplateCPUMemoryCellContent cluster={cluster} namespace={namespace} template={row} />;
};

export default TemplateCPUMemoryCell;
