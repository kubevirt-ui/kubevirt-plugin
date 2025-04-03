import { K8sResourceKind, K8sResourceKindReference } from '@openshift-console/dynamic-plugin-sdk';
import { OdcNodeModel } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { BaseNode } from '@patternfly/react-topology';

class OdcBaseNode extends BaseNode {
  public resource?: K8sResourceKind | undefined = undefined;

  public resourceKind?: K8sResourceKindReference | undefined = undefined;

  constructor() {
    super();
  }

  getResource(): K8sResourceKind | undefined {
    return this.resource;
  }

  getResourceKind(): K8sResourceKindReference | undefined {
    return this.resourceKind;
  }

  setModel(model: OdcNodeModel): void {
    super.setModel(model);

    if ('resource' in model) {
      this.resource = model.resource;
    }
    if ('resourceKind' in model) {
      this.resourceKind = model.resourceKind;
    }
  }

  setResource(resource: K8sResourceKind | undefined): void {
    this.resource = resource;
  }

  setResourceKind(kind: K8sResourceKindReference | undefined): void {
    this.resourceKind = kind;
  }
}

export default OdcBaseNode;
