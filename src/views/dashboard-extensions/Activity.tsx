import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  getGroupVersionKindForModel,
  K8sActivityProps,
  K8sResourceCommon,
  ResourceIcon,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { ActivityItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import ActivityProgress from './ActivityProgress';
import { diskImportKindMapping, VIRTUALMACHINES_TEMPLATES_BASE_URL } from './utils';

export const DiskImportActivity: FC<
  K8sActivityProps<
    K8sResourceCommon & {
      data?: { [key: string]: any };
      spec?: {
        [key: string]: any;
      };
      status?: { [key: string]: any };
    }
  >
> = ({ resource }) => {
  const progress = parseInt(resource?.status?.progress, 10);
  const { kind, name, uid } = resource.metadata.ownerReferences[0];
  const model = diskImportKindMapping[kind];
  const ownerLink =
    model === TemplateModel ? (
      <>
        <ResourceIcon groupVersionKind={getGroupVersionKindForModel(TemplateModel)} />
        <Link
          className="co-resource-item__resource-name"
          data-test-id={name}
          title={uid}
          to={`/k8s/ns/${resource?.metadata?.namespace}/${VIRTUALMACHINES_TEMPLATES_BASE_URL}/${name}`}
        >
          {name}
        </Link>
      </>
    ) : (
      <ResourceLink
        groupVersionKind={getGroupVersionKindForModel(model)}
        name={name}
        namespace={resource.metadata.namespace}
      />
    );
  const title = `Importing ${
    model === TemplateModel ? `${VirtualMachineModel.label} ${model.label}` : model.label
  } disk`;
  return Number.isNaN(progress) ? (
    <>
      <ActivityItem>{title}</ActivityItem>
      {ownerLink}
    </>
  ) : (
    <ActivityProgress progress={progress} title={title}>
      {ownerLink}
    </ActivityProgress>
  );
};
