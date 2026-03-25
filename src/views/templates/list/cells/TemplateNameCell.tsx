import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateURL, isDeprecatedTemplate } from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';

type TemplateNameCellProps = {
  row: V1Template;
};

const TemplateNameCell: FC<TemplateNameCellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const clusterParam = useClusterParam();

  const name = getName(row);
  const namespace = getNamespace(row);
  const cluster = getCluster(row) || clusterParam;

  return (
    <>
      <Link data-test={name} data-test-id={name} to={getTemplateURL(name, namespace, cluster)}>
        <ResourceIcon groupVersionKind={modelToGroupVersionKind(TemplateModel)} />
        {name}
      </Link>
      {isDeprecatedTemplate(row) && <Label isCompact>{t('Deprecated')}</Label>}
    </>
  );
};

export default TemplateNameCell;
