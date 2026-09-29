import { type FC } from 'react';

import { TemplateModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import VMTemplateLink from '@kubevirt-utils/components/VMTemplateLink/VMTemplateLink';
import {
  getGroupVersionKindForModel,
  type K8sActivityProps,
  ResourceLink,
} from '@openshift-console/dynamic-plugin-sdk';
import { ActivityItem } from '@openshift-console/dynamic-plugin-sdk-internal';

import ActivityProgress from './ActivityProgress';
import { diskImportKindMapping } from './utils';

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
      <VMTemplateLink name={name} namespace={resource?.metadata?.namespace} uid={uid} />
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
