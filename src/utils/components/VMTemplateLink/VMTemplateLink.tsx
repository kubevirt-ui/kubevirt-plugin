import type { FC } from 'react';
import { Link } from 'react-router';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { getTemplateURL } from '@kubevirt-utils/resources/template/utils/url';
import { getGroupVersionKindForModel, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';

type VMTemplateLinkProps = {
  cluster?: string;
  dataTest?: string;
  name: string;
  namespace: string;
  uid?: string;
};

/**
 * Links to the VM Template details page owned by this plugin.
 *
 * ResourceLink cannot be used here since Console resolves Template resources to its own
 * details page, which is not the VM Template details page the plugin renders.
 */
const VMTemplateLink: FC<VMTemplateLinkProps> = ({ cluster, dataTest, name, namespace, uid }) => (
  <span className="co-resource-item">
    <ResourceIcon groupVersionKind={getGroupVersionKindForModel(TemplateModel)} />
    <Link
      className="co-resource-item__resource-name"
      data-test={dataTest ?? name}
      title={uid}
      to={getTemplateURL(name, namespace, cluster)}
    >
      {name}
    </Link>
  </span>
);

export default VMTemplateLink;
