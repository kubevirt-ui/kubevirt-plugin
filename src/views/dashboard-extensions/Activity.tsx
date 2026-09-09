import React, { type FC } from 'react';
import { Link } from 'react-router';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  getGroupVersionKindForModel,
  type K8sActivityProps,
  ResourceIcon,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { ActivityItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import ActivityProgress from './ActivityProgress';
import { diskImportKindMapping, VIRTUALMACHINES_TEMPLATES_BASE_URL } from './utils';

export const DiskImportActivity: FC<K8sActivityProps<V1beta1DataVolume>> = ({ resource }) => {
  const progress = parseInt(resource?.status?.progress ?? '', 10);
  const ownerReference = resource.metadata?.ownerReferences?.[0];

  if (!ownerReference) {
    return null;
  }

  const { kind, name, uid } = ownerReference;
  const model = diskImportKindMapping[kind];
  const ownerLink =
    model === TemplateModel ? (
      <>
        <ResourceIcon groupVersionKind={getGroupVersionKindForModel(TemplateModel)} />
        <Link
          className="co-resource-item__resource-name"
          data-test={name}
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
