import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { getGroupVersionKindForModel, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';

import { VIRTUALMACHINES_TEMPLATES_BASE_URL } from '../../../../../../../../dashboard-extensions/utils';

type VMTemplateLinkProps = {
  name: string;
  namespace: string;
  uid?: string;
};

const VMTemplateLink: FC<VMTemplateLinkProps> = ({ name, namespace, uid }) => (
  <>
    <ResourceIcon groupVersionKind={getGroupVersionKindForModel(TemplateModel)} />
    <Link
      className="co-resource-item__resource-name"
      data-test-id={name}
      title={uid}
      to={`/k8s/ns/${namespace}/${VIRTUALMACHINES_TEMPLATES_BASE_URL}/${name}`}
    >
      {name}
    </Link>
  </>
);

export default VMTemplateLink;
