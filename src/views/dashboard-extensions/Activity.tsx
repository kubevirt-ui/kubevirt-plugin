import React, { FC } from 'react';
import { Link } from 'react-router-dom';

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
      spec?: {
        [key: string]: any;
      };
      status?: { [key: string]: any };
      data?: { [key: string]: any };
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
          to={`/k8s/ns/${resource?.metadata?.namespace}/${VIRTUALMACHINES_TEMPLATES_BASE_URL}/${name}`}
          title={uid}
          data-test-id={name}
          className="co-resource-item__resource-name"
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
    <ActivityProgress title={title} progress={progress}>
      {ownerLink}
    </ActivityProgress>
  );
};
