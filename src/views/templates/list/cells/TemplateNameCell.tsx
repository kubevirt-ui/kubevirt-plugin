import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  isDeprecatedTemplate,
  isVirtualMachineTemplateRequest,
  TemplateOrRequest,
} from '@kubevirt-utils/resources/template';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getGroupVersionKindForResource } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Split, Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineTemplateRequestStatusIcon from '../../components/VirtualMachineTemplateRequest/VirtualMachineTemplateRequestStatusIcon';

type TemplateNameCellProps = {
  row: TemplateOrRequest;
};

const TemplateNameCell: FC<TemplateNameCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const clusterParam = useClusterParam();

  const name = getName(row);
  const namespace = getNamespace(row);
  const cluster = getCluster(row) || clusterParam;

  const isVMTR = isVirtualMachineTemplateRequest(row);

  return (
    <Stack>
      <StackItem>
        <Split hasGutter>
          <MulticlusterResourceLink
            cluster={cluster}
            data-test={name}
            data-test-id={name}
            groupVersionKind={getGroupVersionKindForResource(row)}
            name={name}
            namespace={namespace}
          />
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
