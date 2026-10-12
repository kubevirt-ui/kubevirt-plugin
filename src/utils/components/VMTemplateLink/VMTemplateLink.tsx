import type { FC } from 'react';
import { Link } from 'react-router';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  getTemplateModel,
  isOpenShiftTemplate,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getTemplateURL, getVMTemplateURL } from '@kubevirt-utils/resources/template/utils/url';
import { getGroupVersionKindForModel, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';

type VMTemplateLinkProps = {
  cluster?: string;
  dataTest?: string;
  name: string;
  namespace: string;
  template?: Template;
  uid?: string;
};

/**
 * Links to the VM Template details page owned by this plugin (both Template and VirtualMachineTemplate resources)
 *
 * ResourceLink cannot be used here since Console resolves Template resources to its own
 * details page, which is not the VM Template details page the plugin renders.
 */
const VMTemplateLink: FC<VMTemplateLinkProps> = ({
  cluster,
  dataTest,
  name,
  namespace,
  template,
  uid,
}) => {
  const templateModel = !template ? TemplateModel : getTemplateModel(template);
  const getURL = !template || isOpenShiftTemplate(template) ? getTemplateURL : getVMTemplateURL;

  return (
    <span className="co-resource-item">
      <ResourceIcon groupVersionKind={getGroupVersionKindForModel(templateModel)} />
      <Link
        className="co-resource-item__resource-name"
        data-test={dataTest ?? name}
        title={uid}
        to={getURL(name, namespace, cluster)}
      >
        {name}
      </Link>
    </span>
  );
};

export default VMTemplateLink;
