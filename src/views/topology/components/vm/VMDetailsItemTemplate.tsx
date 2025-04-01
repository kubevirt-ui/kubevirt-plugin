import React, { FC } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import VMDetailsItem from './VMDetailsList/components/VMDetailsItem';
import VMTemplateLink from './VMTemplateLink';

export type VMDetailsItemTemplateProps = {
  name: string;
  namespace: string;
};

const VMDetailsItemTemplate: FC<VMDetailsItemTemplateProps> = ({ name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const templatesResource: WatchK8sResource = {
    groupVersionKind: getGroupVersionKindForModel(TemplateModel),
    isList: false,
    name,
    namespace,
  };
  const [template, loadedTemplates, errorTemplates] =
    useK8sWatchResource<V1Template>(templatesResource);

  return (
    <VMDetailsItem
      isLoading={!loadedTemplates}
      isNotAvail={!name || !namespace || (loadedTemplates && !template) || errorTemplates}
      title={t('Template')}
    >
      <VMTemplateLink name={name} namespace={namespace} />
    </VMDetailsItem>
  );
};

export default VMDetailsItemTemplate;
