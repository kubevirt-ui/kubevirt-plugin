import { type FC } from 'react';

import VMTemplateLink from '@kubevirt-utils/components/VMTemplateLink/VMTemplateLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  isDeprecatedTemplate,
  isVirtualMachineTemplateRequest,
  type TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import { getGroupVersionKindForResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, Stack, StackItem } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import VirtualMachineTemplateRequestStatusIcon from '../../components/VirtualMachineTemplateRequest/VirtualMachineTemplateRequestStatusIcon';

type TemplateNameCellProps = {
  row: TemplateOrRequest;
};

const TemplateNameCell: FC<TemplateNameCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const [hubCluster] = useHubClusterName();
  const isACMPage = useIsACMPage();

  const name = getName(row);
  const namespace = getNamespace(row);
  const cluster = isACMPage ? (getCluster(row) ?? hubCluster) : undefined;

  const isVMTR = isVirtualMachineTemplateRequest(row);

  return (
    <Stack>
      <StackItem>
        <Split hasGutter>
          {isVMTR ? (
            <MulticlusterResourceLink
              cluster={cluster}
              data-test={name}
              groupVersionKind={getGroupVersionKindForResource(row)}
              name={name}
              namespace={namespace}
            />
          ) : (
            <VMTemplateLink cluster={cluster} name={name} namespace={namespace} template={row} />
          )}
          {!isVMTR && isDeprecatedTemplate(row) && <Label isCompact>{t('Deprecated')}</Label>}
        </Split>
      </StackItem>
      {isVMTR && (
        <StackItem>
          <VirtualMachineTemplateRequestStatusIcon vmtr={row} />
        </StackItem>
      )}
    </Stack>
  );
};

export default TemplateNameCell;
