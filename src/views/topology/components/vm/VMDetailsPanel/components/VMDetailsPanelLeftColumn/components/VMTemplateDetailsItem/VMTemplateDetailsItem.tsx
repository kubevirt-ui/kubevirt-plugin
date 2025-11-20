import React, { FC } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import VMTemplateLink from './VMTemplateLink';

import '../../../../TopologyVMDetailsPanel.scss';

export type VMDetailsItemTemplateProps = {
  vm: V1VirtualMachine;
};

const VMTemplateDetailsItem: FC<VMDetailsItemTemplateProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const templateName = getLabel(vm, LABEL_USED_TEMPLATE_NAME);
  const templateNamespace = getLabel(vm, LABEL_USED_TEMPLATE_NAMESPACE);

  const templatesResource: WatchK8sResource = {
    groupVersionKind: getGroupVersionKindForModel(TemplateModel),
    isList: false,
    name: templateName,
    namespace: templateNamespace,
  };
  const [template, loadedTemplates, errorTemplates] =
    useK8sWatchResource<V1Template>(templatesResource);

  const notAvailable =
    !templateName || !templateNamespace || (loadedTemplates && !template) || errorTemplates;

  return (
    <DescriptionItem
      descriptionData={
        notAvailable ? (
          <MutedTextSpan text={t('Not available')} />
        ) : (
          <VMTemplateLink name={templateName} namespace={templateNamespace} />
        )
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={<span id="template">{t('Template')}</span>}
    />
  );
};

export default VMTemplateDetailsItem;
