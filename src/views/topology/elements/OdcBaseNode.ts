import { observable } from 'mobx';

import { K8sResourceKindReference } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../clusteroverview/utils/types';
import { getReferenceForResource } from '../utils/k8s-utils';
import { OdcNodeModel } from '../utils/types/topology-types';

//
// Import from @patternfly/react-topology when updated to a branch containing https://github.com/patternfly/patternfly-react/pull/7573
//
import BaseNode from './BaseNode';

class OdcBaseNode extends BaseNode {
  @observable.ref
  private resource?: K8sResourceKind;

  @observable
  private resourceKind?: K8sResourceKindReference;

  getResource(): K8sResourceKind | undefined {
    return this.resource;
  }

  setResource(resource: K8sResourceKind | undefined): void {
    this.resource = resource;
  }

  getResourceKind(): K8sResourceKindReference | undefined {
    return this.resourceKind || getReferenceForResource(this.resource);
  }

  setResourceKind(kind: K8sResourceKindReference | undefined): void {
    this.resourceKind = kind;
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
}

export default OdcBaseNode;
